import React from "react";
import "../styles/Explore.css";
import { Link } from "react-router-dom";


const groups = [
  {
    id: 1,
    title: "Makeup trend 1990",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Papaya Juice",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Brunch with friends",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Art & Crafts At DUMBO",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Cool Rocks",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1507832321772-e86cc0452e9c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cm9ja3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900",
  },
  {
    id: 6,
    title: "Fourth Of July",
    desc: "Give small description",
    img: "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZpcmV3b3Jrc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
  },
];

function Explore() {
  return (
    <main className="explore-page">
      {/* intro header */}
      <div className="explore-intro">
        <h1>Explore</h1>
        <p>Welcome to the Explore page! 🎉</p>
        <p>Here you can discover new content, features, or simply check out what others have been up to.</p>
      </div>

      {/* Hero Section */}
        <section className="explore-hero">
        <div className="hero-overlay">
            <h2>Wow You Looking at other people</h2>
            <p>Be inspire or share love with other randos</p>
            <button className="btn hero-btn">Create A public one?</button>
        </div>
        </section>


      {/* grid of cards */}
      <div className="explore-grid">
        {groups.map((g) => (
          <Link key={g.id} to={`/album/${g.id}`} className="explore-card">
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
        </Link>
        ))}
      </div>

        {/* --- Most Viewed --- */}
        <section className="most-viewed">
        <h2>Most Viewed</h2>

        <div className="mv-grid">
            {/* Featured (big left) */}
            <div className="mv-card featured">
            <img
                src="https://images.unsplash.com/photo-1516571748831-5d81767b788d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RhcnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900"
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
            src="https://images.unsplash.com/photo-1577099608295-f11bbd6fed32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmF0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900"
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
            src="https://images.unsplash.com/photo-1615441000196-cae8adec6ebe?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dHVydGxlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900"
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
}

export default Explore;
