import "../styles/Explore.css";

import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import PopupModal from "../components/PopupModal";

interface Album {
    id: string | null;
    title: string;
    img: string;
    owner: string;
    ownerAvatar?: string;
    privacy?: "public" | "private" | "shared";
    joined?: boolean; // tracks if user has joined
}

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username"); // current logged-in user
    const [notification, setNotification] = useState<string | null>(null);

  // Fetch public albums
    useEffect(() => {
        const fetchAlbums = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/albums/public", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setAlbums(data.albums);
        } catch (err) {
            console.error("Failed to fetch albums:", err);
        } finally {
            setLoading(false);
        }
        };
        fetchAlbums();
    }, [token]);

  // Filter albums by search query
    const filteredAlbums = useMemo(
        () =>
        albums
        .filter((a) => !a.joined)
            .filter((a) =>
            a.title.toLowerCase().includes(query.trim().toLowerCase())
            )
            .slice()
            .reverse(),
        [albums, query]
    );

  // Join an album
    const joinAlbum = async (albumId: string | null) => {
    if (!token || !username) {
        alert("You must be logged in to join an album.");
        return;
    }
    if (!albumId) return;

    setJoiningId(albumId);

    try {
        const res = await fetch(
            `http://127.0.0.1:5000/albums/${albumId}/join`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
            }
            );


        const result = await res.json();

        if (!res.ok && res.status !== 200) {
            alert(result.error || "Failed to join album");
            return;
        }

        // Mark album as joined
        setAlbums((prev) =>
            prev.map((a) =>
            a.id === albumId ? { ...a, joined: true } : a
            )
        );

        // show non-blocking popup for success
        setNotification(result.message || "Joined album successfully!");
        } catch (err) {
        console.error(err);
        alert("Network error while joining album");
        } finally {
        setJoiningId(null);
        }
    };


    // auto-hide notification after 1.5 seconds
    useEffect(() => {
        if (!notification) return;
        const t = setTimeout(() => setNotification(null), 1500);
        return () => clearTimeout(t);
    }, [notification]);
    return (
        <main className="explore-page">
        <div className="explore-intro">
            <h1>Explore</h1>
            <h2>Welcome to the Explore page! 🎉</h2>
            <p>
            Join public albums, connect with others, and celebrate the moments
            that make life special.
            </p>
        </div>

        <section className="explore-hero">
            <div className="hero-overlay">
            <h2>You’re Not Just Looking, You’re Belonging 💜</h2>
            <p>
                Explore the people, projects, and passions that make our experience
                unforgettable.
            </p>
            <button
                className="btn hero-btn"
                onClick={() =>
                navigate("/albums", {
                    state: { openCreate: true, prefillPrivacy: "public" },
                })
                }
            >
                Create A Public Album
            </button>
            </div>
        </section>

        <section className="explore-search">
            <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search albums…"
                className="search-input"
                aria-label="Search albums"
            />
            </div>
        </section>

        {loading && <p className="muted">Loading albums...</p>}
        {!loading && filteredAlbums.length === 0 && (
            <p className="muted no-results">No matches found.</p>
        )}

        <div className="explore-grid">
            {filteredAlbums.map((a) => (
            <div key={a.id ?? Math.random()} className="explore-card">
                {a.img ? (
                <img src={a.img} alt={a.title} className="card-img" />
                ) : (
                <div className="card-img placeholder">📁</div>
                )}
                <div className="card-body">
                <h2>{a.title}</h2>
                <div className="avatars">
                    <div 
                        className="avatar" 
                        title={a.owner}
                        onClick={() => navigate(`/users/${a.owner}`)}
                        style={{ cursor: 'pointer' }}
                    >
                    {a.ownerAvatar ? (
                        <img
                        src={a.ownerAvatar}
                        alt={a.owner}
                        />
                    ) : (
                        <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            a.owner
                        )}`}
                        alt={a.owner}
                        />
                    )}
                    </div>
                </div>
                <button
                    className="btn"
                    onClick={() => joinAlbum(a.id)}
                    disabled={joiningId === a.id || a.joined}
                >
                    {joiningId === a.id
                    ? "Joining…"
                    : a.joined
                    ? "Joined"
                    : "Join"}
                </button>
                </div>
            </div>
            ))}
        </div>
        {notification && (
            <PopupModal title="Success" onClose={() => setNotification(null)}>
                <p>{notification}</p>
            </PopupModal>
        )}
        </main>
    );
};

export default Explore;