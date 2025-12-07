import "../styles/Explore.css";

import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

interface Album {
    id: string | null;
    title: string;
    img: string;
    owner: string;
    privacy?: 'public' | 'private' | 'shared';
    }

    const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchAlbums = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/albums/public");
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
    }, []);

    const filteredAlbums = useMemo(
        () =>
        albums
            .filter((a) =>
            a.title.toLowerCase().includes(query.trim().toLowerCase())
            )
            .slice()
            .reverse(),
        [albums, query]
    );

    const joinAlbum = async (albumId: string | null) => {
        if (!token) {
        alert("You must be logged in to join an album.");
        return;
        }
        if (!albumId) return;

        setJoiningId(albumId);

        try {
        const res = await fetch("http://127.0.0.1:5000/albums/join", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ albumId }),
        });

        const result = await res.json().catch(() => ({}));

        if (res.status === 401) {
            alert("Unauthorized. Please log in again.");
        } else if (res.status === 404) {
            alert("Album not found.");
        } else if (res.ok) {
            alert(result.message || "Joined album successfully!");
            // Refresh albums after joining
            setAlbums(prev => prev.map(a => a.id === albumId ? { ...a } : a));
            navigate("/albums", { state: { joinedAlbumId: albumId } });
        } else {
            alert(result.error || "Failed to join album");
        }
        } catch (err) {
        console.error(err);
        alert("Network error while joining album");
        } finally {
        setJoiningId(null);
        }
    };

    return (
        <main className="explore-page">
        <div className="explore-intro">
            <h1>Explore</h1>
            <h2>Welcome to the Explore page! 🎉</h2>
            <p>Join public albums, connect with others, and celebrate the moments that make life special.</p>
        </div>

        <section className="explore-hero">
            <div className="hero-overlay">
            <h2>You’re Not Just Looking, You’re Belonging 💜</h2>
            <p>Explore the people, projects, and passions that make our experience unforgettable.</p>
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
        {!loading && filteredAlbums.length === 0 && <p className="muted no-results">No matches found.</p>}

        <div className="explore-grid">
            {filteredAlbums.map((a) => (
            <div key={a.id ?? Math.random()} className="explore-card">
                {/* Fallback image if a.img is empty */}
                <img
                src={a.img || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={a.title}
                className="card-img"
                />
                <div className="card-body">
                <h2>{a.title}</h2>
                <div className="avatars">
                    <div className="avatar">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.owner)}`}
                        alt={a.owner}
                    />
                    </div>
                </div>
                <button
                    className="btn"
                    onClick={() => a.id && joinAlbum(a.id)} // ensure id is not null
                    disabled={joiningId === a.id}
                >
                    {joiningId === a.id ? "Joining…" : "Join"}
                </button>
                </div>
            </div>
            ))}
        </div>
        </main>
    );
};

export default Explore;
