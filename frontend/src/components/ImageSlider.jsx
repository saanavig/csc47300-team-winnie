import '../styles/ImageSlider.css';

import { useCallback, useEffect, useState } from 'react';

function ImageSlider({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPhotos, setShuffledPhotos] = useState([]);

  // shuffle algorithm
  const shufflePhotos = useCallback((photoArray) => {
    const shuffled = [...photoArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize shuffled photos when the component mounts or photos change
  useEffect(() => {
    if (photos.length > 0) {
      setShuffledPhotos(shufflePhotos(photos));
    }
  }, [photos, shufflePhotos]);

  // Advance to the next photo every 5 seconds
  useEffect(() => {
    if (shuffledPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledPhotos.length);
    }, 5000);
 
    return () => clearInterval(interval);
  }, [shuffledPhotos]);

  // Handle manual navigation
  const goToNext = () => {
    if (shuffledPhotos.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledPhotos.length);
  };

  const goToPrevious = () => {
    if (shuffledPhotos.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? shuffledPhotos.length - 1 : prevIndex - 1
    );
  };

  if (shuffledPhotos.length === 0) {
    return (
      <div className="empty-slider">
        <h2>Add photos to see the slideshow</h2>
      </div>
    );
  }

  return (
    <div className="slider-container">
      <div className="slider">
        {shuffledPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${photo.url})` }}
          >
            <div className="slide-content">
              {photo.tags.length > 0 && (
                <div className="slide-tags">
                  {photo.tags.map(tag => (
                    <span key={tag} className="slide-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button className="slider-arrow left" onClick={goToPrevious}>❮</button>
      <button className="slider-arrow right" onClick={goToNext}>❯</button>
      
      <div className="slider-dots">
        {shuffledPhotos.map((_, index) => (
          <span 
            key={index}
            className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>

      <div className="scroll-indicator">
        <span>Scroll Down</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </div>
  );
}

export default ImageSlider;