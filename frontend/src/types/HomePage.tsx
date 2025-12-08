import "../styles/HomePage.css";

import ImageSlider from "../components/ImageSlider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Slide {
  id: number;
  url: string;
  caption: string;
  tags: string[];
}

interface Album {
  id: number;
  url: string;
  title: string;
  tags?: string[];
}

type UserComment = {
  id: number;
  author: string;
  text: string;
  date: string;
  avatarUrl?: string;
};

const slides: Slide[] = [
  {
    id: 1,
    url: "https://images.squarespace-cdn.com/content/v1/5af5f71c0dbda32cd6252624/1581193927666-Q1K4BAD27E75GBQFA26J/AdobeStock_317434149+heart+shaped+pizza.jpeg",
    caption: "Nothing Like A Home Cooked Meal",
    tags: ["Home Cooked Meal", "Ingredients", "Messy Kitchen", "Friday Night In"],
  },
  {
    id: 2,
    url: "https://images.alphacoders.com/683/thumb-1920-683731.jpg",
    caption: "Summer Light over Linen",
    tags: ["The Beautiful Sunset", "Summer", "Linen"],
  },
  {
    id: 3,
    url: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437053/796070/main-image",
    caption: "Afternoon Still Life",
    tags: ["Afternoon", "Still Life", "Painting"],
  },
  {
    id: 4,
    url: "https://i.ytimg.com/vi/l4UBqr3Z6r8/maxresdefault.jpg",
    caption: "Switzerland Trip!",
    tags: ["Switzerland", "Summer 2025", "Photography", "Family Travel"],
  },
];


const YOU_AVATAR =
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200";

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();


  const prev = () =>
    setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1));

  const next = () =>
    setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1));


  return (
    <>
      <div className="home-wrapper">   
      {/* HERO SECTION */}
      <section className="hero-full">
        <div className="hero">

          {/* Small badge */}
          <div className="hero-badge">
            ✨ Your memories, beautifully preserved
          </div>

          {/* Main title */}
          <h1 className="hero-title">
            Capture moments,
            <br />
            <span>treasure forever.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Welcome to Winnie Memory Archive! Capture, organize, and revisit the moments that matter. Keep full control with album privacy, 
            smart tags, and shareable groups so your memories look great and stay yours.
          </p>

          <div className="hero-cta">
            <button
              className="cta-btn"
              onClick={() => navigate("/explore")}
            >
              Explore Now →
            </button>
          </div>

          
          <section className="slider-section">
            <ImageSlider photos={slides} />
          </section>

        </div>
      </section>

      </div>
    </>
  );
}
