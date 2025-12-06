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
        "albums": []
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

    access_token = create_access_token(identity=user["username"])

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

    user["avatar"] = user.get("avatarUrl", "")
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
        filename = secure_filename(avatar_file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        if not os.path.exists(app.config["UPLOAD_FOLDER"]):
            os.makedirs(app.config["UPLOAD_FOLDER"])

        avatar_file.save(filepath)
        updates["avatarUrl"] = f"/uploads/{filename}"

    if not updates:
        return jsonify({"error": "No updates provided"}), 400

    users_collection.update_one(
        {"username": {"$regex": f"^{current_user}$", "$options": "i"}},
        {"$set": updates}
    )

    # Fetch updated user so frontend can refresh instantly
    updated_user = users_collection.find_one(
        {"username": {"$regex": f"^{current_user}$", "$options": "i"}},
        {"_id": 0, "password": 0}
    )

    return jsonify({
        "message": "Profile updated successfully!",
        "profile": updated_user
    }), 200

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
            "tags": tags_for_all if tags_for_all else [],
            "uploadDate": datetime.utcnow().isoformat()
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
            if album["owner"] == current_user or current_user in album.get("collaborators", []):
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
            "tags": tags_for_all if tags_for_all else [],
            "uploadDate": datetime.utcnow().isoformat()
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


# invite collaborator
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

    user = users_collection.find_one({"username": current_user}, {"albums": 1})
    if not user:
        return jsonify({"error": "User not found"}), 404

    album = next((a for a in user.get("albums", []) if a["id"] == album_id), None)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if collaborator_username in album.get("collaborators", []):
        return jsonify({"error": "User is already a collaborator"}), 400

    users_collection.update_one(
        {"username": current_user, "albums.id": album_id},
        {"$push": {"albums.$.collaborators": collaborator_username}}
    )

    return jsonify({"message": f"{collaborator_username} added as collaborator!"}), 200

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

    return jsonify({
        "name": user.get("name"),
        "username": user.get("username"),
        "bio": user.get("bio"),
        "avatarUrl": user.get("avatarUrl", ""),  
        "followers": len(user.get("followers", [])),
        "following": len(user.get("following", [])),
        "albums": user.get("albums", [])
    })

@app.route("/users", methods=["GET"])
def list_users():
    users = list(users_collection.find({}, {"_id":0, "username":1, "avatarUrl":1}))
    return jsonify({"users": users})

# public albums for explore
@app.route("/albums/public", methods=["GET"])
def list_public_albums():
    # get all users and their albums
    users = users_collection.find({}, {"_id": 0, "albums": 1, "username":1})

    public_albums = []

    for user in users:
        for album in user.get("albums", []):
            if album.get("privacy", "public") == "public":
                public_albums.append({
                    "id": album["id"],
                    "title": album["title"],
                    "img": album.get("coverUrl", ""),
                    "owner": user["username"]
                })

    return jsonify({"albums": public_albums}), 200

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

    # Format albums
    user_albums = []
    for album in user["albums"]:
        user_albums.append({
            "id": album.get("id"),
            "title": album.get("title"),
            "cover": album.get("coverUrl", ""),
            "privacy": album.get("privacy", "public"),
            "contributors": album.get("contributors", []),
        })

    return jsonify({"albums": user_albums}), 200


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000, threaded=True)
