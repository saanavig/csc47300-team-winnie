import "../styles/LoginPage.css";

import { Link, useNavigate } from "react-router-dom";
import React, { FormEvent, useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        const response = await fetch("http://127.0.0.1:5000/signup", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful!");
            navigate("/login");
        } else {
            setError(data.error || "Signup failed");
        }
        } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong. Please try again.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="login-container">
        <div className="glass-box">
            <h2>Sign Up</h2>

            <form onSubmit={handleSubmit}>
            <div className="input-field">
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                />
            </div>

            <div className="input-field">
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                />
            </div>

            <div className="input-field">
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                />
            </div>

            <div className="input-field">
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
            </button>

            <p className="register-text">
                Already have an account? <Link to="/login">Login</Link>
            </p>
            </form>
        </div>
        </div>
    );
}
