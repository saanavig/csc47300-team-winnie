import React from "react";
import { useNavigate } from "react-router-dom";
import TimelinePhotoCard from "/Users/lilith/csc47300-team-winnie/frontend/src/components/TimelinePhotoCard.tsx";

function AlbumTimeline() {
  const navigate = useNavigate();

  const photos = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
      caption: "Sunrise from the mountain peak – breathtaking moment!",
      likes: 45,
      creator: "Sarah Chen",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500",
      caption: "Nature's palette on full display during golden hour.",
      likes: 32,
      creator: "Mike Johnson",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500",
      caption: "Golden hour magic casting perfect shadows.",
      likes: 28,
      creator: "Emma Wilson",
    },
  ];

  return (
    <main className="album-page">

      <div className="album-header"> What a time to shine  </div>

      <div className="album-grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {photos.map((p) => (
          <TimelinePhotoCard
            key={p.id}
            image={p.image}
            caption={p.caption}
            creator={p.creator}
            likes={p.likes}
            size="medium"
          />
        ))}
      </div>
    </main>
  );
}

export default AlbumTimeline;
