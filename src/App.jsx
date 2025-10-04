import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { Link, Routes, Route } from "react-router-dom";
import viteLogo from '/vite.svg'
import './App.css'
import './main.css';

const slides = [
  {
    src: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
    caption: "Havana Oh nah nah, half my heart is in havana",
  },
  {
    src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
    caption: "Summer light over linen",
  },
  {
    src: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    caption: "Afternoon still life",
  },
];

const albums = [
  {
    title: "Aliens stole my home",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Children are Terrifying",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Troeger",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
];


function App() {
  const [count, setCount] = useState(0)
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIdx(i => (i === slides.length - 1 ? 0 : i + 1));
  const [showProject, setShowProject] = useState(false);


  return (
    <>
      <header className="site-header">
        <div className="user">Stuart</div>
        <nav className="nav">
          <a className="nav-button" href="/explore">Explore/Random</a>
          <a className="nav-button" href="/albums">My Albums</a>
          <a className="nav-button" href="/login">Login?Profile</a>
          <a
            className="nav-button"
            href="#"
            onClick={(e) => { e.preventDefault(); setShowProject(v => !v); }}
          >
            Our Project
          </a>
        </nav>
      </header>

      {showProject && (
        <div className="container">
        <h1>CSc 47300: Website Design Idea</h1>

        <h2>Goal</h2>
        <p>
          Our website is an interactive web application designed to provide users with a platform to store, share, and explore digital memories, photos, stories, and milestones. The platform allows users to maintain full control over the visibility of their content, offering privacy settings for individual posts, photos, and tags. Users can organize their content within friend groups and choose whether to make it public or keep it private. This application is intended for a broad audience, helping people preserve personal memories in a digital format while providing customizable privacy options.
        </p>

        <h2>Features</h2>
        <ul>
          <li>Users can choose to keep their account or content public, private, or restricted.</li>
            <li>Ability to create and manage friend groups, where users can control the visibility of their posts within specific circles.</li>
            <li>Randomizer for discovering content from other users, with options to shuffle through posts or memories.</li>
            <li>Full-page sliders and customizable layouts for presenting memories in an engaging format.</li>
            <li>Option to generate private or public sharing links for specific content.</li>
        </ul>

        <h2>Target Audience</h2>
        <p>
            This application is ideal for anyone looking to digitize their memories while retaining control over their privacy. It can also be useful for friends, families, and communities looking to preserve shared experiences.
        </p>
      
        </div>
      )}

      
      <section className="wide home-hero">
        <h1>Welcome! Take a Peek!</h1>
        <p>
          Blah blah blah, have fun and send photos. Have a peek………
        </p>

        <h2 className="section-title">&lt;Group Name&gt; Recent Photos Posted</h2>

        <div className="carousel-wrap">
          <div className="viewport">
            <div className="track" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {slides.map((s, i) => (
                <figure key={i} className="slide">
                  <img src={s.src} alt={s.caption} />
                  <figcaption className="overlay">
                    <span className="avatar">👤</span>
                    <span className="cap">{s.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* arrows INSIDE the image */}
            <button className="chev left"  onClick={prev}  aria-label="Previous slide"></button>
            <button className="chev right" onClick={next} aria-label="Next slide"></button>
          </div>
        </div>

        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={i === idx ? "dot active" : "dot"}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <section className="albums">
        <h2>Albums</h2>

        <div className="albums-grid">
          {albums.map((a) => (
            <article className="album-card" key={a.title}>
              <img src={a.cover} alt={a.title} />
              <h3>{a.title}</h3>
              <div className="album-members">
                <span className="avatar a1">👥</span>
                <span className="avatar a2">👤</span>
                <span className="avatar a3">👤</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      </section>
    </>
  );
}

export default App
