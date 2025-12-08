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
  {
    id: 5,
    url: "https://cdn.fondecranvip.com/2025/09/heKHMOND-fond-de-neige-27.webp",
    caption: "Christmas Holidays - First Snow",
    tags: ["Merry Christmas", "Winter Time", "Snow"],
  },
  {
    id: 6,
    url: "https://wallpaper.forfun.com/fetch/7a/7a3bbab6fd3f4ec1f68b1fa5678d8bb4.jpeg",
    caption: "",
    tags: ["Brunch with Friends", "Central Park", "Sunny Day"],
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?fm=jpg&q=60&w=3000",
    caption: "",
    tags: ["Hiking", "Beautiful Landscape", "Mountains"],
  },
];

const albums: Album[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600",
    title: "Notes for CSC 473!",
    tags: ["typescript", "javascript"],
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600",
    title: "GSOE Expo 2025",
    tags: ["engineering", "projects"],
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600",
    title: "Fall 2025 Club Fair!",
    tags: ["snacks", "clubs"],
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600",
    title: "CCNY Freshmen Orientation",
    tags: ["freshmen", "friends", "ccny"],
  },
];

const initialComments: UserComment[] = [
  {
    id: 3,
    author: "Saanavi",
    text: "Love the lighting in these shots!",
    date: "Oct 26, 2025",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
  },
  {
    id: 2,
    author: "Stuart",
    text: "This album makes me miss summer ☀️",
    date: "Oct 25, 2025",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
  },
  {
    id: 1,
    author: "Sam",
    text: "Can you upload the raw files too?",
    date: "Oct 24, 2025",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
  },
];

const YOU_AVATAR =
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200";

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [comments, setComments] = useState<UserComment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const navigate = useNavigate();

  function openAlbum(album: Album) {
    const id = String(album.id);
    try {
      const saved = sessionStorage.getItem("winnieAlbums");
      const albums = saved ? JSON.parse(saved) : [];
      const exists = albums.find((a: any) => a.id === id);

      if (!exists) {
        albums.push({
          id,
          name: album.title || `Album ${id}`,
          coverPhoto: album.url,
          photoCount: 0,
          privacy: "public",
          createdAt: new Date().toISOString(),
        });
        sessionStorage.setItem("winnieAlbums", JSON.stringify(albums));
      }
    } catch {}

    navigate(`/album/${id}`);
  }

  const prev = () =>
    setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1));

  const next = () =>
    setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  function submitComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    setComments((prev) => [
      {
        id: (prev[0]?.id ?? 0) + 1,
        author: "You",
        text,
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        avatarUrl: YOU_AVATAR,
      },
      ...prev,
    ]);

    setCommentText("");
  }

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
