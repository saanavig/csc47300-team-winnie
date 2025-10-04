import '../styles/Explore.css';

import ImageSlider from '../components/ImageSlider'
import { useState } from 'react';

const slides = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
        caption: "Havana Oh nah nah, half my heart is in havana",
        tags: ["travel", "Havana"],
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        caption: "Summer light over linen",
        tags: ["summer", "light"],
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
        caption: "Afternoon still life",
        tags: ["afternoon", "still life"],
    },
];

const albums = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "Aliens stole my home",
        tags: ["alien", "sci-fi"],
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "Children are Terrifying",
        tags: ["kids", "funny"],
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "Troeger",
        tags: ["abstract", "art"],
    },
];


export default function Explore() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => setCurrentIndex(i => (i === 0 ? slides.length - 1 : i - 1));
    const next = () => setCurrentIndex(i => (i === slides.length - 1 ? 0 : i + 1));

    return (
    <div className="explore-page">
        <h1>Explore Memories</h1>

        {/* Slider */}
        <section className="slider-section">
        <ImageSlider
            photos={slides}
            currentIndex={currentIndex}
            onPrev={prev}
            onNext={next}
        />
        </section>

        {/* Albums */}
        <section className="albums-section">
        <h2>Recent Albums</h2>
        <div className="albums-grid">
            {albums.map((album) => (
            <div key={album.id} className="album-card">
                <img src={album.url} alt={album.title} />
                <h3>{album.title}</h3>
                {album.tags && album.tags.length > 0 && (
                <div className="album-tags">
                    {album.tags.map((tag) => (
                    <span key={tag} className="album-tag">{tag}</span>
                    ))}
                </div>
                )}
            </div>
            ))}
        </div>
        </section>
    </div>
);

}
