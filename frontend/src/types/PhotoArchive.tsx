import "../styles/PhotoArchive.css";

import ImageSlider, { Photo } from "../components/ImageSlider";
import { useEffect, useState } from "react";

import PhotoGrid from "../components/PhotoGrid";
import PhotoUploader from "../components/PhotoUploader";
import TagFilter from "../components/TagFilter";

export default function PhotoArchive() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [showUploader, setShowUploader] = useState<boolean>(false);

    useEffect(() => {
        const savedPhotos = sessionStorage.getItem("winniePhotos");
        if (savedPhotos) {
        try {
            setPhotos(JSON.parse(savedPhotos) as Photo[]);
        } catch (e) {
            console.error("Failed to parse stored photos:", e);
            setPhotos([]);
        }
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("winniePhotos", JSON.stringify(photos));
    }, [photos]);

    const handlePhotoUploaded = (newPhoto: Photo) => {
        setPhotos([newPhoto, ...photos]);
        setShowUploader(false);
    };

    return (
        <div className="photo-archive">
        {/* Full-screen slider section */}
        <section className="slider-section">
            <ImageSlider photos={photos} />
        </section>

        {/* Main content section */}
        <section className="content-section">
            <header className="archive-header">
            <h1>Winnie Memory Archive</h1>
            <p>Store, share, and explore your digital memories</p>
            <button
                className="toggle-uploader"
                onClick={() => setShowUploader(!showUploader)}
            >
                {showUploader ? "Hide Upload Form" : "Add New Memory"}
            </button>
            </header>

            {showUploader && (
            <PhotoUploader onPhotoUploaded={handlePhotoUploaded} />
            )}

            {photos.length > 0 && (
            <TagFilter
                photos={photos}
                activeTag={activeTag}
                onSelectTag={setActiveTag}
            />
            )}

            <PhotoGrid photos={photos} filterTag={activeTag} />
        </section>
        </div>
    );
}
