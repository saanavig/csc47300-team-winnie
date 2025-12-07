import React, { useEffect, useState } from "react";
import "../styles/ImageSlider.css";

export interface Photo {
  id: string | number;
  url: string;
  tags: string[];
}

interface ImageSliderProps {
  photos: Photo[];
}

export default function ImageSlider({ photos }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPhotos, setShuffledPhotos] = useState<Photo[]>([]);

  // Load photos normally (no shuffle)
  useEffect(() => {
    setShuffledPhotos(photos);
    setCurrentIndex(0);
  }, [photos]);

  // Keep index in range
  useEffect(() => {
    if (shuffledPhotos.length === 0) return;

    setCurrentIndex((idx) => {
      if (idx < 0) return shuffledPhotos.length - 1;
      if (idx >= shuffledPhotos.length) return 0;
      return idx;
    });
  }, [shuffledPhotos]);

  // Auto advance every 5s
  useEffect(() => {
    if (shuffledPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledPhotos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shuffledPhotos]);

  // Manual navigation
  const goToPrevious = () => {
    if (shuffledPhotos.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? shuffledPhotos.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    if (shuffledPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % shuffledPhotos.length);
  };

  // Track image loading errors so we can surface a visible placeholder
  const [erroredIndexes, setErroredIndexes] = useState<Record<number, boolean>>({});

  // If no photos, show placeholder
  if (shuffledPhotos.length === 0) {
    return (
      <div className="empty-slider">
        <h2>Add photos to see the slideshow</h2>
      </div>
    );
  }

  return (
    <div className="image-slider-container">
      <div className="image-slider">
        {shuffledPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={`image-slide ${index === currentIndex ? "active" : ""}`}
          >
            {erroredIndexes[index] ? (
              <div className="image-slide-fallback">Image failed to load</div>
            ) : (
              <img
                src={photo.url}
                alt={`Slide ${index}`}
                className="image-slide-img"
                onError={() => {
                  setErroredIndexes((s) => ({ ...s, [index]: true }));
                  // also log to console to help debugging in the browser
                  // eslint-disable-next-line no-console
                  console.error(`ImageSlider: failed to load image at index ${index}: ${photo.url}`);
                }}
                onLoad={() => {
                  setErroredIndexes((s) => {
                    if (!s[index]) return s;
                    const copy = { ...s };
                    delete copy[index];
                    return copy;
                  });
                }}
              />
            )}

            <div className="image-slide-content">
              {photo.tags.length > 0 && (
                <div className="image-slide-tags">
                  {photo.tags.map((tag) => (
                    <span key={tag} className="image-slide-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className="image-slider-arrow left" onClick={goToPrevious}>
        ❮
      </button>
      <button className="image-slider-arrow right" onClick={goToNext}>
        ❯
      </button>

      {/* Dots */}
      <div className="image-slider-dots">
        {shuffledPhotos.map((_, index) => (
          <span
            key={index}
            className={`image-slider-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}
