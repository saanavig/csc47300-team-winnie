import "../styles/ImageSlider.css";

import { useCallback, useEffect, useState } from "react";

export interface Photo {
    id: string | number;
    url: string;
    tags: string[];
}

interface ImageSliderProps {
photos: Photo[];
currentIndex?: number;
onPrev?: () => void;
onNext?: () => void;
}

export default function ImageSlider({
photos,
currentIndex: externalIndex,
onPrev,
onNext,
}: ImageSliderProps) {

    // index of the currently visible slide
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    // local shuffled copy so original order isn't mutated
    const [shuffledPhotos, setShuffledPhotos] = useState<Photo[]>([]);

    // shuffle wrapped in useCallback so it doesn't recreate every render
    const shufflePhotos = useCallback((photoArray: Photo[]): Photo[] => {
        const shuffled = [...photoArray];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // when photos prop changes, create a shuffled copy for this slider instance
    useEffect(() => {
        if (photos.length > 0) {
        setShuffledPhotos(shufflePhotos(photos));
        }
    }, [photos, shufflePhotos]);

    // auto-advance the slider every 5s
    useEffect(() => {
        if (shuffledPhotos.length === 0) return;

        const interval = setInterval(() => {
            // modulo basically ensures we're in range of existing photos
            setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledPhotos.length);
        }, 5000);

        // reset interval on unmount or change.
        return () => clearInterval(interval);
    }, [shuffledPhotos]);

    // Manual controls
    const goToNext = () => {
        if (shuffledPhotos.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledPhotos.length);
    };

    const goToPrevious = () => {
        if (shuffledPhotos.length === 0) return;
        setCurrentIndex((prevIndex) =>
        // if at start go to end of list, otherwise decrement 1
        prevIndex === 0 ? shuffledPhotos.length - 1 : prevIndex - 1
        );
    };

    // shows an empty state when there are no photos
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
            {/* map each photo to a slide element */}
            {shuffledPhotos.map((photo, index) => (
            <div
                key={photo.id}
                className={`slide ${index === currentIndex ? "active" : ""}`}
                style={{ backgroundImage: `url(${photo.url})` }}
            >
                <div className="slide-content">
                {photo.tags.length > 0 && (
                    <div className="slide-tags">
                    {photo.tags.map((tag) => (
                        // map tags to readable badges
                        <span key={tag} className="slide-tag">
                        {tag}
                        </span>
                    ))}
                    </div>
                )}
                </div>
            </div>
            ))}
        </div>

        {/* Navigation Arrows */}
        <button className="slider-arrow left" onClick={goToPrevious}>
            ❮
        </button>
        <button className="slider-arrow right" onClick={goToNext}>
            ❯
        </button>

        {/* Navigation Dots */}
        <div className="slider-dots">
            {shuffledPhotos.map((_, index) => (
            <span
                key={index}
                className={`slider-dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
            ></span>
            ))}
        </div>

        {/* Scroll Indicator */}
        {/* <div className="scroll-indicator">
            <span>Scroll Down</span>
            <div className="scroll-arrow">↓</div>
        </div> */}
        </div>
    );
}
