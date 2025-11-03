import React, { useState } from "react";
import "/Users/lilith/csc47300-team-winnie/frontend/src/styles/Timeline-card.css";

interface TimelinePhotoCardProps {
  image: string;
  caption: string;
  likes: number;
  creator: string;
  size?: "small" | "medium" | "large";
}

export const TimelinePhotoCard: React.FC<TimelinePhotoCardProps> = ({
  image,
  caption,
  likes: initialLikes,
  creator,
  size = "medium",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const sizeClass = `timeline-card--${size}`;

  const handleLike = (e: React.MouseEvent) => {
    // prevent parent click from firing if you later add navigation
    e.stopPropagation();
    setIsLiked((prev) => {
      const next = !prev;
      setLikes((l) => (next ? l + 1 : l - 1));
      return next;
    });
  };

  return (
    <div
      className={`timeline-card ${sizeClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={caption}
    >
      <div className="timeline-card__image-container" aria-hidden>
        <img
          src={image}
          alt={caption}
          className={`timeline-card__image ${isHovered ? "is-hovered" : ""} ${
            isLiked ? "is-liked" : ""
          }`}
        />
      </div>

      <div
        className={`timeline-card__overlay ${isHovered ? "is-visible" : ""}`}
        aria-hidden={!isHovered}
      >
        <div className="timeline-card__text">
          <p className="timeline-card__creator">📸 {creator}</p>
          <p className="timeline-card__caption">{caption}</p>
        </div>
      </div>

      <div className="timeline-card__like">
        <button
          className={`timeline-card__like-button ${isLiked ? "is-liked" : ""}`}
          onClick={handleLike}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike" : "Like"}
          type="button"
        >
          <span className="timeline-card__like-icon" aria-hidden>
            ❤️
          </span>
        </button>
        <span className="timeline-card__like-count">{likes}</span>
      </div>
    </div>
  );
};

export default TimelinePhotoCard;