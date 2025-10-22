from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import os

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)
print("JWT key loaded:", os.getenv("JWT_SECRET_KEY"))


client = MongoClient(os.getenv("MONGO_URI"))
db = client["project-winnie"]
users_collection = db["users"]

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
        "friends": [],
        "albums": []
    })

    return jsonify({"message": "Signup successful!"}), 201

# login
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

    access_token = create_access_token(identity=user["username"])

    return jsonify({
        "message": "Login successful!",
        "token": access_token
    }), 200

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = users_collection.find_one({"username": current_user}, {"_id": 0, "password": 0})
    return jsonify({"profile": user}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
