from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["project-winnie"]
users_collection = db["users"]

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})

# signup route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not name or not username or not email or not password:
        return jsonify({"error": "All fields (name, username, email, password) are required"}), 400

    # Check duplicates
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
        "friends": [],
        "albums": []
    })

    return jsonify({"message": "Signup successful!"}), 201

# login route
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful!",
        "user": {
            "name": user["name"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
