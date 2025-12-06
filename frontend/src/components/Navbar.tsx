import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import React from 'react';

import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    sub?: string;
    username?: string;
    email?: string;
    exp?: number;
    }

    export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState<string | null>(null);

    const loadUserFromToken = () => {
        const token = localStorage.getItem("token");
        if (token) {
        try {
            const decoded: DecodedToken = jwtDecode(token);
            setUsername(decoded.sub || decoded.username || null);
        } catch {
            console.warn("Invalid token");
            setUsername(null);
        }
        } else {
        setUsername(null);
        }
    };

    useEffect(() => {
        loadUserFromToken();
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <header className="site-header">
        <div className="user">{username ? `Hi, ${username}!` : "Guest"}</div>
        <nav className="nav">
            <Link to="/" className="nav-button">Home</Link>
            <Link to="/explore" className="nav-button">Explore</Link>
            <Link to="/albums" className="nav-button">My Albums</Link>
            {username && (
            <Link to="/profile" className="nav-button">Profile</Link>
            )}

            {!username ? (
            <Link to="/login" className="nav-button">Login</Link>
            ) : (
            <Link to="/login" className="nav-button" onClick={handleLogout}>Logout</Link>

            )}
        </nav>
        </header>
    );
}
