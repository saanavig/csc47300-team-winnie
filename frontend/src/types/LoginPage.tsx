import "../styles/LoginPage.css";

import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

interface LoginResponse {
    message: string;
    token: string;
    error?: string;
    }

    export default function LoginPage(): JSX.Element {
    const [identifier, setIdentifier] = useState<string>(""); // username or email
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: identifier, password }), // backend accepts email OR username
        });

        const data: LoginResponse = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            console.log("✅ JWT Token:", data.token);
            navigate("/profile"); // redirect after successful login
        } else {
            setError(data.error || "Login failed");
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
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
            <div className="input-field">
                <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Username"
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

            <div className="options">
                <label>
                <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>

            <p className="register-text">
                Don't have an account? <Link to="/signup">Register</Link>
            </p>
            </form>
        </div>
        </div>
    );
}
