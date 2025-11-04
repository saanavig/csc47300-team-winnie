import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhotoUploader from '../components/PhotoUploader';
import PhotoGrid from '../components/PhotoGrid';
import TagFilter from '../components/TagFilter';
import ImageSlider from '../components/ImageSlider';
import '../styles/PhotoArchive.css';
import { Photo, Album } from './index';

export default function PhotoArchive() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [albumName, setAlbumName] = useState<string>('');

  // Load photos from sessionStorage and filter by albumId; also resolve album name
  useEffect(() => {
    const savedPhotos = sessionStorage.getItem('winniePhotos');
    if (savedPhotos) {
      try {
        const allPhotos = JSON.parse(savedPhotos);
        const filteredPhotos = albumId
          ? allPhotos.filter((photo: Photo) => photo.albumId === albumId)
          : allPhotos;
        setPhotos(filteredPhotos);
      } catch (e) {
        console.error('Failed to parse stored photos:', e);
        setPhotos([]);
      }
    }

    if (albumId) {
      const savedAlbums = sessionStorage.getItem('winnieAlbums');
      if (savedAlbums) {
        try {
          const albums: Album[] = JSON.parse(savedAlbums);
          const album = albums.find((a) => a.id === albumId);
          if (album) {
            setAlbumName(album.name);
          }
        } catch (e) {
          console.error('Failed to parse albums:', e);
        }
      }
    }
  }, [albumId]);

  // Persist photos and update album metadata (photoCount, coverPhoto) when photos change
  useEffect(() => {
    sessionStorage.setItem('winniePhotos', JSON.stringify(photos));
    
    if (albumId) {
      const savedAlbums = sessionStorage.getItem('winnieAlbums');
      if (savedAlbums) {
        try {
          const albums: Album[] = JSON.parse(savedAlbums);
          const updatedAlbums = albums.map((album) => {
            if (album.id === albumId) {
              return {
                ...album,
                photoCount: photos.length,
                coverPhoto: photos[0]?.url || album.coverPhoto,
              };
            }
            return album;
          });
          sessionStorage.setItem('winnieAlbums', JSON.stringify(updatedAlbums));
        } catch (e) {
          console.error('Failed to update album:', e);
        }
      }
    }
  }, [photos, albumId]);

  // called by PhotoUploader with a new Photo; attach current albumId and prepend to photos array
  const handlePhotoUploaded = (newPhoto: Photo) => {
    const photoWithAlbum = { ...newPhoto, albumId };
    setPhotos([photoWithAlbum, ...photos]);
    setShowUploader(false);
  };

  return (
    <div className="photo-archive">
      <section className="slider-section">
        {/* ImageSlider maps photos to slides */}
        <ImageSlider photos={photos} />
      </section>

      <section className="content-section">
        <header className="archive-header">
          <button className="back-button" onClick={() => navigate('/albums')}>
            ← Back to Albums
          </button>
          <h1>{albumName || 'Photo Archive'}</h1>
          <p>Store, share, and explore your digital memories</p>
          <button
            className="toggle-uploader"
            onClick={() => setShowUploader(!showUploader)}
          >
            {showUploader ? 'Hide Upload Form' : 'Add New Memory'}
          </button>
        </header>

        {/* Conditionally show uploader form */}
        {showUploader && <PhotoUploader onPhotoUploaded={handlePhotoUploaded} />}

        {/* Show tag filter only when there are photos */}
        {photos.length > 0 && (
          <TagFilter
            photos={photos}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
          />
        )}
        
        {/* PhotoGrid renders photos (filtered by activeTag) */}
        <PhotoGrid photos={photos} filterTag={activeTag} />
      </section>
    </div>
  );
}