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

  // Helper: load album data from server (falls back to sessionStorage)
  const fetchAlbumFromServer = async () => {
    const token = localStorage.getItem('token');
    if (!albumId) return;

    // Try server first when authenticated
    if (token) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const found = json.album;
          if (found) {
            // Normalize server photos -> Photo[]
            const serverPhotos: Photo[] = (found.photos || []).map((p: any, idx: number) => {
              let url = "";
              let tags: string[] = [];
              let uploadDate = new Date().toISOString();
              let id = `${found.id}-photo-${idx}`;

              if (!p) {
                return { id, url: "", tags: [], uploadDate, albumId: found.id } as Photo;
              }

              if (typeof p === "string") {
                url = p;
              } else if (typeof p === "object") {
                // try multiple common fields cloudinary / custom backends might return
                url =
                  p.url ||
                  p.secure_url ||
                  p.secureUrl ||
                  p.path ||
                  p.src ||
                  p.location ||
                  (p.data && p.data.url) ||
                  "";

                // get tags from possible places
                if (Array.isArray(p.tags)) tags = p.tags;
                else if (Array.isArray(p.tagList)) tags = p.tagList;
                else if (p.metadata && Array.isArray(p.metadata.tags)) tags = p.metadata.tags;
                else if (p.context && p.context.custom && p.context.custom.tags) {
                  try {
                    tags = JSON.parse(p.context.custom.tags);
                  } catch {
                    tags = String(p.context.custom.tags).split(",").map((t: string) => t.trim()).filter(Boolean);
                  }
                }

                uploadDate = p.uploadDate || p.createdAt || uploadDate;
                id = p.id || id;
              }

              if (!url) {
                // helpful debug; open DevTools console to inspect any problematic photo objects
                // eslint-disable-next-line no-console
                console.warn("Photo missing url from server album:", { albumId: found.id, raw: p });
              }

              return {
                id,
                url,
                tags,
                uploadDate,
                albumId: found.id,
              } as Photo;
            });

            // Only keep photos that have a valid url
            setPhotos(serverPhotos.filter((ph) => !!ph.url));
            setAlbumName(found.title ?? found.name ?? albumName);
            return;
          }
        } else {
          console.warn("Failed to fetch album from server:", res.status);
        }
      } catch (err) {
        console.warn("Error fetching album from server:", err);
      }
    }

    // Fallback: sessionStorage if unauthenticated or server fetch fails
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
    } else {
      setPhotos([]);
    }
  };

  // Load photos from sessionStorage and filter by albumId; also resolve album name
  useEffect(() => {
    fetchAlbumFromServer();
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
    // after a local upload, re-fetch from server to ensure server state is reflected
    // (no-op if unauthenticated or server not reachable)
    fetchAlbumFromServer();
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

        {/* Conditionally show uploader form - pass albumId so uploader can POST to server */}
        {showUploader && (
          <PhotoUploader albumId={albumId || undefined} onPhotoUploaded={handlePhotoUploaded} />
        )}

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