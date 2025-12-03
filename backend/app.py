from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask import send_from_directory
import os

import cloudinary
import cloudinary.uploader
import cloudinary.api

from datetime import datetime

load_dotenv()
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

client = MongoClient(os.getenv("MONGO_URI"), tls=True, tlsAllowInvalidCertificates=True)
db = client["project-winnie"]
users_collection = db["users"]

def setup_indexes():
    users_collection.create_index("username", unique=True)
    users_collection.create_index("email", unique=True)

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

#signup
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
        "albums": []
    })

    return jsonify({"message": "Signup successful!"}), 201

# login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    identifier = data.get("email") or data.get("username")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Email/Username and password are required"}), 400

    user = users_collection.find_one({
        "$or": [{"email": identifier}, {"username": identifier}]
    })

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email/username or password"}), 401

    access_token = create_access_token(identity=user["username"])

    return jsonify({
        "message": "Login successful!",
        "token": access_token
    }), 200

# profile
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

    # Get bio from form data
    bio = request.form.get("bio")

    # Get avatar file
    avatar_file = request.files.get("avatar")

    updates = {}
    if bio is not None:
        updates["bio"] = bio
    if avatar_file:
        filename = secure_filename(avatar_file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        avatar_file.save(filepath)
        # Save URL that can be accessed from frontend
        updates["avatarUrl"] = f"/uploads/{filename}"

    if not updates:
        return jsonify({"error": "No updates provided"}), 400

    users_collection.update_one({"username": current_user}, {"$set": updates})
    return jsonify({"message": "Profile updated successfully!", "avatarUrl": updates.get("avatarUrl")}), 200

# Serve uploaded images
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# send friend request
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

        # Initialize missing fields
        for u in [sender, receiver]:
            if "friendRequests" not in u:
                u["friendRequests"] = {"incoming": [], "outgoing": []}
            if "friends" not in u:
                u["friends"] = []
            if "followers" not in u:
                u["followers"] = []
            if "following" not in u:
                u["following"] = []

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

# accept/decline friend request
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
    else:
        return jsonify({"message": "Friend request declined"}), 200


# followers and following
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

#testing clopudinary
@app.route("/test-upload", methods=["POST"])
def test_upload():
    print("Files received:", request.files)
    file = request.files.get("file")
    if not file:
        return {"error": "No file provided"}, 400

    result = cloudinary.uploader.upload(file)
    print("Upload result:", result)
    return {"url": result.get("secure_url")}

# connecting cloudinary to backend 

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000, threaded=True)
