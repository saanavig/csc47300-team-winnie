import "../styles/Explore.css";

import React from "react";

interface Group {
    id: number;
    title: string;
    desc: string;
    img: string;
    }

    const groups: Group[] = [
    {
        id: 1,
        title: "Werido 1",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Weridos 2",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Weridos 3",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 4,
        title: "Weridos 4",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 5,
        title: "Weridos 5",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop",
    },
    {
        id: 6,
        title: "Weridos 6",
        desc: "Give small description",
        img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop",
    },
    ];

    const Explore: React.FC = () => {
    return (
        <main className="explore-page">
        {/* Intro Header */}
        <div className="explore-intro">
            <h1>Explore</h1>
            <p>Welcome to the Explore page! 🎉</p>
            <p>
            Here you can discover new content, features, or simply check out what
            others have been up to.
            </p>
        </div>

        {/* Hero Section */}
        <section className="explore-hero">
            <div className="hero-overlay">
            <h2>Wow You Looking at other people</h2>
            <p>Be inspired or share love with other randos</p>
            <button className="btn hero-btn">Create A public one?</button>
            </div>
        </section>

        {/* Grid of Cards */}
        <div className="explore-grid">
            {groups.map((g) => (
            <div key={g.id} className="explore-card">
                <img src={g.img} alt={g.title} className="card-img" />

                <div className="card-body">
                <h2>{g.title}</h2>
                <p className="muted">{g.desc}</p>

                <div className="avatars">
                    <span className="avatar a1" />
                    <span className="avatar a2" />
                    <span className="avatar a3" />
                </div>

                <button className="btn">Join</button>
                </div>
            </div>
            ))}
        </div>

        {/* Most Viewed Section */}
        <section className="most-viewed">
            <h2>Most Viewed</h2>

            <div className="mv-grid">
            {/* Featured (big left) */}
            <div className="mv-card featured">
                <img
                src="https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop"
                alt="Album Name"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>Album Name</h3>
                <div className="avatars">
                    <span className="avatar a1" />
                    <span className="avatar a2" />
                    <span className="avatar a3" />
                </div>
                </div>
            </div>

            {/* Small top-right */}
            <div className="mv-card small small-top">
                <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                alt="AlbumName"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>AlbumName</h3>
                <div className="avatars">
                    <span className="avatar a1" />
                    <span className="avatar a2" />
                    <span className="avatar a3" />
                </div>
                </div>
            </div>

            {/* Small bottom-right */}
            <div className="mv-card small small-bottom">
                <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                alt="Album Name"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>Album Name</h3>
                <div className="avatars">
                    <span className="avatar a1" />
                    <span className="avatar a2" />
                    <span className="avatar a3" />
                </div>
                </div>
            </div>
            </div>
        </section>
        </main>
    );
};

export default Explore;
