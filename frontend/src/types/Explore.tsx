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

    // Fetch public albums from backend
    useEffect(() => {
        const fetchAlbums = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/albums/public");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setAlbums(data.albums); // <-- get array from object
        } catch (err) {
            console.error("Failed to fetch albums:", err);
        } finally {
            setLoading(false);
        }
        };

        fetchAlbums();
    }, []);

    // Filter albums based on search query
    const filteredAlbums = useMemo(
        () =>
        albums.filter((a) =>
            a.title.toLowerCase().includes(query.trim().toLowerCase())
        ),
        [albums, query]
    );

    return (
        <main className="explore-page">
        {/* Intro Header */}
        <div className="explore-intro">
            <h1>Explore</h1>
            <h2>Welcome to the Explore page! 🎉</h2>
            <p>
            Join public albums, connect with others, and celebrate the moments
            that make life special.
            </p>
        </div>

        {/* Hero Section */}
        <section className="explore-hero">
            <div className="hero-overlay">
            <h2>You’re Not Just Looking, You’re Belonging 💜</h2>
            <p>
                Explore the people, projects, and passions that make our
                experience unforgettable.
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

        {/* Search */}
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

        {/* Loading / No Results */}
        {loading && <p className="muted">Loading albums...</p>}
        {!loading && filteredAlbums.length === 0 && (
            <p className="muted no-results">No matches found.</p>
        )}

        {/* Grid of Cards */}
        <div className="explore-grid">
            {filteredAlbums.map((a) => (
            <div key={a.id ?? Math.random()} className="explore-card">
                <img src={a.img} alt={a.title} className="card-img" />
                <div className="card-body">
                <h2>{a.title}</h2>
                <div className="avatars">
                    <div className="avatar">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        a.owner
                        )}`}
                        alt={a.owner}
                    />
                    </div>
                </div>
                <button className="btn">Join</button>
                </div>
            </div>
            ))}
        </div>
        </main>
    );
};

export default Explore;
