from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json

import cloudinary
import cloudinary.uploader
import cloudinary.api

load_dotenv()
app = Flask(__name__)
# CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["UPLOAD_FOLDER"] = "uploads"

jwt = JWTManager(app)

client = MongoClient(os.getenv("MONGO_URI"), tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
db = client["project-winnie"]
users_collection = db["users"]

# add a simple DB connectivity check flag
DB_CONNECTED = False
try:
    client.admin.command("ping")
    DB_CONNECTED = True
    print("✅ MongoDB connected")
except Exception as e:
    DB_CONNECTED = False
    print("❌ MongoDB connection failed at startup:", e)

def setup_indexes():
    try:
        users_collection.create_index("username", unique=True)
        users_collection.create_index("email", unique=True)
    except Exception as e:
        print("⚠️ setup_indexes: could not create indexes (DB not available):", e)

setup_indexes()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})

# signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not name or not username or not email or not password:
        return jsonify({"error": "All fields (name, username, email, password) are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 400

    hashed_pw = generate_password_hash(password)

    users_collection.insert_one({
        "name": name,
        "username": username,
        "email": email,
        "password": hashed_pw,
        "bio": "",
        "avatarUrl": "",
        "followers": [],
        "following": [],
        "friendRequests": {"incoming": [], "outgoing": []},
        "friends": [],
        "albums": [],
        "role": "user"
    })

    return jsonify({"message": "Signup successful!"}), 201

# login route - wrap DB ops so a DB error doesn't crash the server
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    identifier = data.get("email") or data.get("username")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Email/Username and password are required"}), 400

    if not DB_CONNECTED:
        return jsonify({"error": "Database unavailable. Try again later."}), 503

    try:
        user = users_collection.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })
    except Exception as e:
        print("❌ DB error in /login:", e)
        return jsonify({"error": "Database error"}), 500

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email/username or password"}), 401

    access_token = create_access_token(
        identity=user["username"],
        additional_claims={"role": user.get("role", "user")}
    )

    return jsonify({
        "message": "Login successful!",
        "token": access_token
    }), 200

# get profile
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = users_collection.find_one(
        {"username": current_user},
        {"_id": 0, "password": 0}
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"profile": user}), 200

# edit profile
@app.route("/profile/update", methods=["POST"])
@jwt_required()
def edit_profile():
    current_user = get_jwt_identity()

    bio = request.form.get("bio")
    avatar_file = request.files.get("avatar")

    updates = {}
    if bio is not None:
        updates["bio"] = bio

    if avatar_file:
        try:
            # Upload avatar directly to Cloudinary and store secure url
            # use a user-specific public_id to avoid collisions
            public_id = f"avatars/{current_user}_{uuid.uuid4().hex}"
            upload_opts = {"public_id": public_id, "overwrite": True}
            result = cloudinary.uploader.upload(avatar_file, **upload_opts)
            secure_url = result.get("secure_url")
            if secure_url:
                updates["avatarUrl"] = secure_url
            else:
                # fallback to saving locally if cloudinary failed
                filename = secure_filename(avatar_file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                if not os.path.exists(app.config["UPLOAD_FOLDER"]):
                    os.makedirs(app.config["UPLOAD_FOLDER"])
                avatar_file.save(filepath)
                updates["avatarUrl"] = f"/uploads/{filename}"
        except Exception as e:
            print("⚠️ Cloudinary upload failed, falling back to local save:", e)
            filename = secure_filename(avatar_file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            if not os.path.exists(app.config["UPLOAD_FOLDER"]):
                os.makedirs(app.config["UPLOAD_FOLDER"])
            avatar_file.save(filepath)
            updates["avatarUrl"] = f"/uploads/{filename}"

    if not updates:
        return jsonify({"error": "No updates provided"}), 400

    users_collection.update_one({"username": current_user}, {"$set": updates})
    # return the new avatarUrl and updated bio if present
    response_obj = {"message": "Profile updated successfully!"}
    if "avatarUrl" in updates:
        response_obj["avatarUrl"] = updates.get("avatarUrl")
    if "bio" in updates:
        response_obj["bio"] = updates.get("bio")
    return jsonify(response_obj), 200

# serve uploaded files
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# friend requests
@app.route("/friends/request", methods=["POST"])
@jwt_required()
def send_friend_request():
    try:
        current_user = get_jwt_identity()
        data = request.json or {}
        target_username = data.get("username")

        if not target_username:
            return jsonify({"error": "Username is required"}), 400
        if target_username == current_user:
            return jsonify({"error": "You cannot friend yourself"}), 400

        sender = users_collection.find_one({"username": current_user})
        receiver = users_collection.find_one({"username": target_username})

        if not receiver:
            return jsonify({"error": "User not found"}), 404

        if target_username in sender.get("friends", []):
            return jsonify({"error": "Already friends"}), 400
        if target_username in sender["friendRequests"]["outgoing"]:
            return jsonify({"error": "Friend request already sent"}), 400

        users_collection.update_one(
            {"username": current_user},
            {"$push": {"friendRequests.outgoing": target_username}}
        )
        users_collection.update_one(
            {"username": target_username},
            {"$push": {"friendRequests.incoming": current_user}}
        )

        return jsonify({"message": f"Friend request sent to {target_username}!"}), 200

    except Exception as e:
        print("❌ Error in /friends/request:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/friends/respond", methods=["POST"])
@jwt_required()
def respond_friend_request():
    current_user = get_jwt_identity()
    data = request.json
    sender_username = data.get("username")
    action = data.get("action")

    if not sender_username or action not in ["accept", "decline"]:
        return jsonify({"error": "Username and valid action required"}), 400

    sender = users_collection.find_one({"username": sender_username})
    receiver = users_collection.find_one({"username": current_user})

    if not sender or sender_username not in receiver["friendRequests"]["incoming"]:
        return jsonify({"error": "No such friend request"}), 404

    users_collection.update_one(
        {"username": current_user},
        {"$pull": {"friendRequests.incoming": sender_username}}
    )
    users_collection.update_one(
        {"username": sender_username},
        {"$pull": {"friendRequests.outgoing": current_user}}
    )

    if action == "accept":
        users_collection.update_one(
            {"username": current_user},
            {"$push": {"friends": sender_username, "followers": sender_username}}
        )
        users_collection.update_one(
            {"username": sender_username},
            {"$push": {"friends": current_user, "following": current_user}}
        )
        return jsonify({"message": "Friend request accepted"}), 200

    return jsonify({"message": "Friend request declined"}), 200

@app.route("/friends/list", methods=["GET"])
@jwt_required()
def get_friends_info():
    current_user = get_jwt_identity()
    user = users_collection.find_one(
        {"username": current_user},
        {"_id": 0, "friends": 1, "followers": 1, "following": 1, "friendRequests": 1}
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user), 200

# test cloudinary upload
@app.route("/test-upload", methods=["POST"])
def test_upload():
    file = request.files.get("file")
    if not file:
        return {"error": "No file provided"}, 400

    result = cloudinary.uploader.upload(file)
    return {"url": result.get("secure_url")}

# create album
@app.route("/albums/create", methods=["POST"])
@jwt_required()
def create_album():
    current_user = get_jwt_identity()

    title = request.form.get("title")
    if not title:
        return jsonify({"error": "Album title is required"}), 400

    privacy = request.form.get("privacy", "public")
    if privacy not in ["private", "shared", "public"]:
        privacy = "public"

    raw_tags = request.form.get("tags")
    tags_for_all = []
    if raw_tags:
        try:
            tags_for_all = json.loads(raw_tags)
            if not isinstance(tags_for_all, list):
                tags_for_all = []
        except Exception:
            tags_for_all = [t.strip() for t in raw_tags.split(",") if t.strip()]

    files = request.files.getlist("photos")
    if not files:
        return jsonify({"error": "At least one photo is required"}), 400

    uploaded_results = [cloudinary.uploader.upload(f) for f in files]
    uploaded_urls = [r.get("secure_url") for r in uploaded_results]

    photo_objs = []
    for idx, url in enumerate(uploaded_urls):
        photo_objs.append({
            "id": str(uuid.uuid4()),
            "url": url,
            "filename": files[idx].filename if idx < len(files) else "photo.jpg",
            "tags": tags_for_all if tags_for_all else [],
            "uploadDate": datetime.utcnow().isoformat(),
            "uploadedBy": current_user
        })

    album = {
        "id": str(uuid.uuid4()),
        "title": title,
        "photos": photo_objs,
        "createdAt": datetime.utcnow().isoformat(),
        "coverUrl": photo_objs[0]["url"] if photo_objs else None,
        "owner": current_user,
        "collaborators": [],
        "privacy": privacy
    }

    users_collection.update_one(
        {"username": current_user},
        {"$push": {"albums": album}}
    )

    return jsonify({"message": "Album created successfully!", "album": album}), 201

# list album
@app.route("/albums/list", methods=["GET"])
@jwt_required()
def list_albums():
    current_user = get_jwt_identity()

    # get all albums where current_user is owner or collaborator
    users = users_collection.find(
        {"$or":[
            {"username": current_user},
            {"albums.collaborators": current_user}
        ]},
        {"_id": 0, "albums": 1}
    )

    albums = []
    for user in users:
        for album in user.get("albums", []):
            if album.get("owner") == current_user or current_user in album.get("collaborators", []):
                albums.append(album)

    return jsonify({"albums": albums}), 200

# get specific album
@app.route("/albums/<album_id>", methods=["GET"])
@jwt_required()
def get_album(album_id):
    current_user = get_jwt_identity()
    user = users_collection.find_one(
        {"albums.id": album_id},
        {"_id": 0, "albums.$": 1}
    )
    if not user:
        return jsonify({"error": "Album not found"}), 404

    album = user["albums"][0]
    if current_user != album["owner"] and current_user not in album.get("collaborators", []):
        return jsonify({"error": "Not authorized"}), 403

    return jsonify({"album": album}), 200

# delete album
@app.route("/albums/<album_id>", methods=["DELETE"])
@jwt_required()
def delete_album(album_id):
    current_user = get_jwt_identity()
    user = users_collection.find_one({"username": current_user, "albums.id": album_id}, {"albums":1})
    if not user:
        return jsonify({"error": "Album not found"}), 404

    users_collection.update_one(
        {"username": current_user},
        {"$pull": {"albums": {"id": album_id}}}
    )
    return jsonify({"message": "Album deleted successfully"}), 200


@app.route("/albums/<album_id>/archive", methods=["POST"])
@jwt_required()
def archive_album(album_id):
    """Mark an album as archived/rejected so it won't appear in public/user listings."""
    current_user = get_jwt_identity()

    # Find owner of the album
    owner_doc = users_collection.find_one({"albums.id": album_id})
    if not owner_doc:
        return jsonify({"error": "Album not found"}), 404

    # Only allow archive if current_user is owner or has role 'admin'
    owner_username = owner_doc.get("username")
    requester = users_collection.find_one({"username": current_user}, {"role": 1})
    is_admin = requester and requester.get("role") == "admin"

    if current_user != owner_username and not is_admin:
        return jsonify({"error": "Not authorized to archive this album"}), 403

    # Set album status to 'rejected' (soft-archive)
    users_collection.update_one(
        {"albums.id": album_id},
        {"$set": {"albums.$.status": "rejected"}}
    )

    return jsonify({"message": "Album archived (status set to rejected)"}), 200

# add photos to an existing album
@app.route("/albums/<album_id>/add-photos", methods=["POST"])
@jwt_required()
def add_photos_to_album(album_id):
    current_user = get_jwt_identity()
    files = request.files.getlist("photos")

    if not files:
        return jsonify({"error": "At least one photo is required"}), 400

    # tags param (applies to these uploaded photos)
    raw_tags = request.form.get("tags")
    tags_for_all = []
    if raw_tags:
        try:
            tags_for_all = json.loads(raw_tags)
            if not isinstance(tags_for_all, list):
                tags_for_all = []
        except Exception:
            tags_for_all = [t.strip() for t in raw_tags.split(",") if t.strip()]

    user = users_collection.find_one({"albums.id": album_id}, {"albums.$": 1})
    if not user:
        return jsonify({"error": "Album not found"}), 404

    album = user["albums"][0]
    if current_user != album["owner"] and current_user not in album.get("collaborators", []):
        return jsonify({"error": "Not authorized to modify this album"}), 403

    uploaded_objs = []
    for file in files:
        result = cloudinary.uploader.upload(file)
        url = result.get("secure_url")
        obj = {
            "id": str(uuid.uuid4()),
            "url": url,
            "filename": file.filename,
            "tags": tags_for_all if tags_for_all else [],
            "uploadDate": datetime.utcnow().isoformat(),
            "uploadedBy": current_user
        }
        uploaded_objs.append(obj)

    # push objects into album.photos
    users_collection.update_one(
        {"albums.id": album_id},
        {"$push": {"albums.$.photos": {"$each": uploaded_objs}}}
    )

    # return the created photo objects
    return jsonify({
        "message": f"{len(uploaded_objs)} photo(s) added successfully!",
        "photos": uploaded_objs
    }), 200

# remove photo (owner or collaborator)
@app.route("/albums/<album_id>/remove-photo", methods=["POST"])
@jwt_required()
def remove_photo_from_album(album_id):
    current_user = get_jwt_identity()
    data = request.json
    photo_url = data.get("photoUrl")
    if not photo_url:
        return jsonify({"error": "photoUrl is required"}), 400

    user = users_collection.find_one({"albums.id": album_id}, {"albums.$": 1})
    if not user:
        return jsonify({"error": "Album not found"}), 404

    album = user["albums"][0]
    if current_user != album["owner"] and current_user not in album.get("collaborators", []):
        return jsonify({"error": "Not authorized"}), 403

    if photo_url not in album.get("photos", []):
        return jsonify({"error": "Photo not found"}), 404

    users_collection.update_one(
        {"albums.id": album_id},
        {"$pull": {"albums.$.photos": photo_url}}
    )

    return jsonify({"message": "Photo removed"}), 200

# set cover (owner or collaborator)
@app.route("/albums/<album_id>/set-cover", methods=["POST"])
@jwt_required()
def set_album_cover(album_id):
    current_user = get_jwt_identity()
    data = request.json
    cover_url = data.get("coverUrl")
    if not cover_url:
        return jsonify({"error": "coverUrl is required"}), 400

    user = users_collection.find_one({"albums.id": album_id}, {"albums.$": 1})
    if not user:
        return jsonify({"error": "Album not found"}), 404

    album = user["albums"][0]
    if current_user != album["owner"] and current_user not in album.get("collaborators", []):
        return jsonify({"error": "Not authorized"}), 403

    if cover_url not in album.get("photos", []):
        return jsonify({"error": "coverUrl must be one of the album photos"}), 400

    users_collection.update_one(
        {"albums.id": album_id},
        {"$set": {"albums.$.coverUrl": cover_url}}
    )

    return jsonify({"message": "Album cover set", "coverUrl": cover_url}), 200

@app.route("/albums/<album_id>/invite", methods=["POST"])
@jwt_required()
def invite_collaborator(album_id):
    current_user = get_jwt_identity()
    data = request.json
    collaborator_username = data.get("username")

    if not collaborator_username:
        return jsonify({"error": "Username is required"}), 400
    if collaborator_username == current_user:
        return jsonify({"error": "Owner is already part of the album"}), 400

    collaborator = users_collection.find_one({"username": collaborator_username})
    if not collaborator:
        return jsonify({"error": "User not found"}), 404

    # Get the album entry for this user (the album owner)
    user = users_collection.find_one({"username": current_user}, {"albums": 1})
    if not user:
        return jsonify({"error": "User not found"}), 404

    album = next((a for a in user.get("albums", []) if a["id"] == album_id), None)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    collaborators = [str(c) for c in album.get("collaborators", [])]
    requests = [str(r) for r in album.get("collaborator_requests", [])]

    if collaborator_username in collaborators:
        return jsonify({"error": "User is already a collaborator"}), 400

    if collaborator_username in requests:
        return jsonify({"error": "User already has a pending invite"}), 400

    # Add pending request to the album object
    users_collection.update_one(
        {"username": current_user, "albums.id": album_id},
        {"$addToSet": {"albums.$.collaborator_requests": collaborator_username}}
    )

    # Add notification to invitee
    users_collection.update_one(
        {"username": collaborator_username},
        {"$push": {
            "notifications": {
                "type": "album_invite",
                "album_id": album_id,
                "album_title": album["title"],
                "inviter": current_user,
                "status": "pending",
                "timestamp": datetime.utcnow()
            }
        }}
    )

    # persist invite so Accept/Decline endpoint can find it
    try:
        db.album_invites.insert_one({
            "album_id": album_id,
            "invitee": collaborator_username,
            "inviter": current_user,
            "status": "pending",
            "timestamp": datetime.utcnow()
        })
    except Exception as e:
        print("⚠️ Warning: failed to insert into album_invites:", e)

    return jsonify({"message": f"You invited {collaborator_username}!"}), 200


# remove collaborator (owner only)
@app.route("/albums/<album_id>/remove-collaborator", methods=["POST"])
@jwt_required()
def remove_collaborator(album_id):
    current_user = get_jwt_identity()
    data = request.json
    collaborator_username = data.get("username")
    if not collaborator_username:
        return jsonify({"error": "Username is required"}), 400

    user = users_collection.find_one({"albums.id": album_id}, {"albums.$": 1})
    if not user:
        return jsonify({"error": "Album not found"}), 404

    album = user["albums"][0]
    if current_user != album["owner"]:
        return jsonify({"error": "Only owner can remove collaborators"}), 403

    if collaborator_username not in album.get("collaborators", []):
        return jsonify({"error": "Not a collaborator"}), 400

    users_collection.update_one(
        {"albums.id": album_id},
        {"$pull": {"albums.$.collaborators": collaborator_username}}
    )

    return jsonify({"message": f"{collaborator_username} removed from collaborators"}), 200

@app.route("/users/<username>", methods=["GET"])
def get_public_profile(username):
    user = users_collection.find_one({"username": username}, {"_id": 0, "password": 0})

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Filter out archived/rejected albums
    visible_albums = []
    for album in user.get("albums", []):
        if album.get("status") == "rejected":
            continue
        visible_albums.append(album)

    return jsonify({
        "name": user.get("name"),
        "username": user.get("username"),
        "bio": user.get("bio"),
        "avatar": user.get("avatarUrl"),
        "followers": len(user.get("followers", [])),
        "following": len(user.get("following", [])),
        "albums": visible_albums
    })

@app.route("/users", methods=["GET"])
def list_users():
    users = list(users_collection.find({}, {"_id":0, "username":1, "avatarUrl":1}))
    return jsonify({"users": users})

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

@app.route("/albums/public", methods=["GET"])
def list_public_albums():
    try:
        # try to get current user; if not logged in, set as None
        current_user = None
        try:
            verify_jwt_in_request(optional=True)
            current_user = get_jwt_identity()
        except:
            pass

        users = users_collection.find({}, {"_id": 0, "albums": 1, "username": 1, "avatarUrl": 1})
        public_albums = []

        for user in users:
            for album in user.get("albums", []):
                # skip archived/rejected albums
                if album.get("status") == "rejected":
                    continue
                if album.get("privacy", "public") == "public":
                    public_albums.append({
                        "id": album["id"],
                        "title": album["title"],
                        "img": album.get("coverUrl", ""),
                        "owner": user["username"],
                        "ownerAvatar": user.get("avatarUrl", ""),
                        "joined": current_user in album.get("collaborators", []) if current_user else False
                    })

        return jsonify({"albums": public_albums}), 200
    except Exception as e:
        print("Error in /albums/public:", e)
        return jsonify({"albums": []}), 500


# user albums for profile view
@app.route("/albums/user", methods=["GET"])
@jwt_required()
def list_user_albums():
    current_user = get_jwt_identity()

    user = users_collection.find_one(
        {"username": current_user},
        {"_id": 0, "albums": 1}
    )

    if not user or "albums" not in user:
        return jsonify({"albums": []}), 200

    # Format albums (exclude archived)
    user_albums = []
    for album in user["albums"]:
        if album.get("status") == "rejected":
            continue
        user_albums.append({
            "id": album.get("id"),
            "title": album.get("title"),
            "cover": album.get("coverUrl", ""),
            "privacy": album.get("privacy", "public"),
            "contributors": album.get("contributors", []),
        })

    return jsonify({"albums": user_albums}), 200

# join public album
@app.route("/albums/<album_id>/join", methods=["POST"])
@jwt_required()
def join_album(album_id):
    current_user = get_jwt_identity()

    # Find the album owner document
    owner_doc = users_collection.find_one({"albums.id": album_id})
    if not owner_doc:
        return jsonify({"error": "Album not found"}), 404

    # Get the album
    album = next((a for a in owner_doc["albums"] if a["id"] == album_id), None)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    # Cannot join if already owner
    if album["owner"] == current_user:
        return jsonify({"error": "You are the owner of this album"}), 400

    # Already joined
    if current_user in album.get("collaborators", []):
        return jsonify({"message": "Already joined", "joined": True}), 200

    # Add current user as collaborator in owner's album
    users_collection.update_one(
        {"albums.id": album_id},
        {"$push": {"albums.$.collaborators": current_user}}
    )

    # Add album reference to current user's albums as 'shared'
    shared_album = {
        "id": album["id"],
        "title": album["title"],
        "photos": album.get("photos", []),
        "createdAt": album.get("createdAt"),
        "coverUrl": album.get("coverUrl"),
        "owner": album["owner"],
        "collaborators": album.get("collaborators", []) + [current_user],
        "privacy": "shared"
    }

    users_collection.update_one(
        {"username": current_user},
        {"$push": {"albums": shared_album}}
    )

    return jsonify({"message": "Joined album successfully!", "joined": True}), 200


def get_user_avatar(username):
    user = db.users.find_one({"username": username})
    return user.get("avatarUrl") if user else "https://i.pravatar.cc/80"

# notifications for collabs
@app.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user = get_jwt_identity()
    user = users_collection.find_one(
        {"username": current_user}, 
        {"notifications": 1}
    )
    return jsonify({"notifications": user.get("notifications", [])}), 200

# invite users to collaborate
@app.route("/albums/invites", methods=["GET"])
@jwt_required()
def get_album_invites():
    username = get_jwt_identity()

    invites = list(db.album_invites.find({"invitee": username}))
    formatted = []

    for inv in invites:
        album = db.albums.find_one({"_id": inv["album_id"]})
        formatted.append({
            "album_id": inv["album_id"],
            "album_title": album.get("title") if album else "Unknown Album",
            "inviter": inv.get("inviter")
        })

    return jsonify({"invites": formatted}), 200

# accept/decline collab requests
@app.route("/albums/<album_id>/invite/respond", methods=["POST"])
@jwt_required()
def respond_to_album_invite(album_id):
    username = get_jwt_identity()
    data = request.json
    action = data.get("action")

    invite = db.album_invites.find_one({
        "album_id": album_id,
        "invitee": username
    })

    if not invite:
        return jsonify({"error": "Invite not found"}), 404

    if action == "accept":
        # Add to album contributors
        db.albums.update_one(
            {"_id": album_id},
            {"$addToSet": {"contributors": username}}
        )

        # Remove invite
        db.album_invites.delete_one({
            "album_id": album_id,
            "invitee": username
        })

        return jsonify({"message": "Invite accepted"}), 200

    elif action == "decline":
        db.album_invites.delete_one({
            "album_id": album_id,
            "invitee": username
        })
        return jsonify({"message": "Invite declined"}), 200

    else:
        return jsonify({"error": "Invalid action"}), 400

# Admin dashboard - get recent albums
@app.route("/admin/albums", methods=["GET"])
def get_admin_albums():
    """Fetch the 10 most recent albums from all users"""
    try:
        limit = request.args.get("limit", 10, type=int)
        
        # get all users with their albums
        users = list(users_collection.find({}, {"_id": 0, "username": 1, "albums": 1}))
        
        all_albums = []
        for user in users:
            username = user.get("username", "")
            for album in user.get("albums", []):
                # skip archived/rejected albums
                if album.get("status") == "rejected":
                    continue
                created_at = album.get("createdAt")
                # Convert datetime to ISO format string if it's a datetime object
                if isinstance(created_at, datetime):
                    created_at = created_at.isoformat()
                
                all_albums.append({
                    "id": album.get("id"),
                    "name": album.get("title"),
                    "photoCount": len(album.get("photos", [])),
                    "privacy": album.get("privacy", "public"),
                    "date": created_at,
                    "owner": album.get("owner", username),
                    "coverUrl": album.get("coverUrl")
                })
        
        all_albums.sort(key=lambda x: x.get("date") or "", reverse=True)
        
        return jsonify({"albums": all_albums[:limit]}), 200
    except Exception as e:
        print("❌ Error in /admin/albums:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "albums": []}), 500

# Admin dashboard - get recent photos
@app.route("/admin/recent-photos", methods=["GET"])
def get_recent_photos():
    """Fetch the 10 most recent photos from all users' albums"""
    try:
        limit = request.args.get("limit", 10, type=int)
        
        # get all users with their albums
        users = list(users_collection.find({}, {"_id": 0, "username": 1, "albums": 1}))
        
        all_photos = []
        for user in users:
            username = user.get("username", "")
            for album in user.get("albums", []):
                for photo in album.get("photos", []):
                    # Handle both old format (string URL) and new format (dict)
                    if isinstance(photo, str):
                        # Old format: photo is just a URL string
                        all_photos.append({
                            "id": "",
                            "thumbnail": photo,
                            "file": "photo.jpg",
                            "uploadDate": "",
                            "user": username,
                            "albumId": album.get("id"),
                            "albumTitle": album.get("title")
                        })
                    else:
                        # New format: photo is a dict with metadata
                        # Use uploadedBy if available, otherwise fall back to album owner
                        uploader = photo.get("uploadedBy", username)
                        all_photos.append({
                            "id": photo.get("id"),
                            "thumbnail": photo.get("url"),
                            "file": photo.get("filename", "photo.jpg"),
                            "uploadDate": photo.get("uploadDate"),
                            "user": uploader,
                            "albumId": album.get("id"),
                            "albumTitle": album.get("title")
                        })
        
        all_photos.sort(key=lambda x: x.get("uploadDate") or "", reverse=True)
        
        return jsonify({"photos": all_photos[:limit]}), 200
    except Exception as e:
        print("❌ Error in /admin/recent-photos:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "photos": []}), 500

# Admin dashboard - get statistics
@app.route("/admin/stats", methods=["GET"])
def get_dashboard_stats():
    """Get dashboard statistics: total photos, albums, public/private counts"""
    try:
        users = list(users_collection.find({}, {"_id": 0, "albums": 1}))
        
        total_photos = 0
        total_albums = 0
        public_count = 0
        private_count = 0
        
        for user in users:
            albums = user.get("albums", [])
            total_albums += len(albums)
            
            for album in albums:
                photos = album.get("photos", [])
                photo_count = len(photos)
                total_photos += photo_count
                
                # Count by album privacy
                privacy = album.get("privacy", "public")
                
                if privacy == "private":
                    private_count += photo_count
                else:  # public or shared
                    public_count += photo_count
        
        print(f"📊 Dashboard stats - Photos: {total_photos}, Albums: {total_albums}, Public: {public_count}, Private: {private_count}")
        
        return jsonify({
            "totalPhotos": total_photos,
            "totalAlbums": total_albums,
            "publicCount": public_count,
            "privateCount": private_count
        }), 200
    except Exception as e:
        print("❌ Error in /admin/stats:", e)
        import traceback
        traceback.print_exc()
        return jsonify({
            "totalPhotos": 0,
            "totalAlbums": 0,
            "publicCount": 0,
            "privateCount": 0,
            "error": "Internal server error"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000, threaded=True)