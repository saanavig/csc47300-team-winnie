import { useState, useEffect } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import PhotoGrid from '../components/PhotoGrid';
import TagFilter from '../components/TagFilter';
import ImageSlider from '../components/ImageSlider';
import '../styles/PhotoArchive.css';

function PhotoArchive() {
  // We'll use localStorage to persist photos for now
  const [photos, setPhotos] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [showUploader, setShowUploader] = useState(false);

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('winniePhotos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (e) {
        console.error("Failed to parse stored photos:", e);
        setPhotos([]);
      }
    }
  }, []);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('winniePhotos', JSON.stringify(photos));
  }, [photos]);

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([newPhoto, ...photos]);
    setShowUploader(false);
  };

  return (
    <div className="photo-archive">
      {/* Full-screen slider section */}
      <section className="slider-section">
        <ImageSlider photos={photos} />
      </section>

      {/* Content section - shown when scrolling down */}
      <section className="content-section">
        <header className="archive-header">
          <h1>Winnie Memory Archive</h1>
          <p>Store, share, and explore your digital memories</p>
          <button 
            className="toggle-uploader" 
            onClick={() => setShowUploader(!showUploader)}
          >
            {showUploader ? 'Hide Upload Form' : 'Add New Memory'}
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

export default PhotoArchive;