import '../styles/Albums.css';

import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Album } from './index';

export default function Albums() {
  const navigate = useNavigate();
  const location = useLocation();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [expandedCategories, setExpandedCategories] = useState({
    private: true,
    shared: true,
    public: true,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumPrivacy, setNewAlbumPrivacy] = useState<'private' | 'shared' | 'public'>('private');

  // Cover upload states for the create-album modal
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      // ignore non-images; could show an error if desired
      return;
    }
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // Load albums from sessionStorage once on mount
  useEffect(() => {
    const loadAlbums = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://127.0.0.1:5000/albums/list", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            // normalize server shape -> frontend Album type
            const serverAlbums = (json.albums || []).map((a: any) => ({
              id: a.id,
              name: a.title ?? a.name ?? "Untitled",
              coverPhoto: a.coverUrl ?? (a.photos && a.photos[0]) ?? undefined,
              photoCount: (a.photos && a.photos.length) || 0,
              privacy: a.privacy ?? "public",
              createdAt: a.createdAt ?? new Date().toISOString(),
              collaborators: a.collaborators ?? [],
            }));
            setAlbums(serverAlbums);
            return;
          } else {
            console.warn("Failed to fetch albums from server:", res.status);
          }
        } catch (err) {
          console.warn("Error fetching albums from server:", err);
        }
      }

      // fallback to sessionStorage if no token or fetch failed
      const saved = sessionStorage.getItem("winnieAlbums");
      if (saved) {
        try {
          setAlbums(JSON.parse(saved));
        } catch {
          setAlbums([]);
        }
      }
    };

    loadAlbums();
  }, []);

  // Persist albums whenever they change
  useEffect(() => {
    sessionStorage.setItem('winnieAlbums', JSON.stringify(albums));
  }, [albums]);

  // open modal if navigated here with state.openCreate (from Explore)
  useEffect(() => {
    const navState = (location.state ?? {}) as { openCreate?: boolean; prefillPrivacy?: string };
    if (navState.openCreate) {
      setNewAlbumPrivacy((navState.prefillPrivacy as 'private'|'shared'|'public') ?? 'public');
      setShowCreateModal(true);
      // clear the navigation state so it doesn't reopen if user refreshes/goes back
      navigate(location.pathname, { replace: true, state: {} });
    }
  // navigate & location in deps (runs once when arriving)
  }, [location, navigate]);

  const toggleCategory = (category: 'private' | 'shared' | 'public') => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Create a new album: try server if auth token and a cover file are present,
  // otherwise fall back to client-only sessionStorage creation.
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    setCreateError(null);
    const token = localStorage.getItem('token'); // adjust key to match your auth

    // If we have an auth token and a selected cover file, send to backend
    if (token && coverFile) {
      setCreating(true);
      try {
        const form = new FormData();
        form.append('title', newAlbumName);
        form.append('privacy', newAlbumPrivacy);
        // backend expects files under 'photos' (list) — send cover as single photo
        form.append('photos', coverFile, coverFile.name);

        const res = await fetch('http://127.0.0.1:5000/albums/create', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Server returned ${res.status}`);
        }

        const json = await res.json();
        const serverAlbum = json.album;
        // Normalize server album shape to frontend Album interface
        const created: Album = {
          id: serverAlbum.id,
          name: serverAlbum.title || newAlbumName,
          coverPhoto: serverAlbum.coverUrl || serverAlbum.photos?.[0] || undefined,
          photoCount: (serverAlbum.photos && serverAlbum.photos.length) || 0,
          privacy: serverAlbum.privacy || newAlbumPrivacy,
          createdAt: serverAlbum.createdAt || new Date().toISOString(),
        };

        setAlbums((prev) => [...prev, created]);
        // reset modal state
        setNewAlbumName('');
        setCoverFile(null);
        setCoverPreview('');
        setShowCreateModal(false);
      } catch (err: any) {
        setCreateError(err?.message || 'Failed to create album on server');
      } finally {
        setCreating(false);
      }
      return;
    }

    // Fallback: client-only album (no server)
    const newAlbum: Album = {
      id: Date.now().toString(),
      name: newAlbumName,
      photoCount: 0,
      privacy: newAlbumPrivacy,
      coverPhoto: coverPreview || undefined,
      createdAt: new Date().toISOString(),
    };
    setAlbums([...albums, newAlbum]);
    setNewAlbumName('');
    // reset cover states
    setCoverFile(null);
    setCoverPreview('');
    setShowCreateModal(false);
  };

  // Navigate to album detail page (PhotoArchive) for the clicked album
  const handleAlbumClick = (albumId: string) => {
    navigate(`/album/${albumId}`);
  };

  // retrive albums by privacy category
  const getAlbumsByPrivacy = (privacy: 'private' | 'shared' | 'public') => {
    return albums.filter(album => album.privacy === privacy);
  };

  // Map array of Album objects to album cards
  const renderAlbumGrid = (categoryAlbums: Album[]) => {
    return (
      <div className="albums-grid">
        {categoryAlbums.map(album => (
          <article
            key={album.id}
            className="album-card"
            onClick={() => handleAlbumClick(album.id)}
          >
            {album.coverPhoto ? (
              <img src={album.coverPhoto} alt={album.name} />
            ) : (
              <div className="album-placeholder">
                <span className="album-icon">📁</span>
              </div>
            )}
            <div className="album-info">
              <h3>{album.name}</h3>
              <p className="photo-count">{album.photoCount} photos</p>
            </div>
          </article>
        ))}
      </div>
    );
  };

  // Render a collapsible category section with empty state and messages
  const renderCategory = (
    category: 'private' | 'shared' | 'public',
    title: string,
    emptyMessage: string
  ) => {
    const categoryAlbums = getAlbumsByPrivacy(category);
    const isExpanded = expandedCategories[category];

    return (
      <section className="album-category">
        <div className="category-header" onClick={() => toggleCategory(category)}>
          <h2>
            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
            {title}
            <span className="count">({categoryAlbums.length})</span>
          </h2>
        </div>

        {isExpanded && (
          <div className="category-content">
            {categoryAlbums.length === 0 ? (
              <div className="empty-state">
                <p>{emptyMessage}</p>
                <button
                  className="create-album-btn"
                  onClick={() => {
                    setNewAlbumPrivacy(category);
                    setShowCreateModal(true);
                  }}
                >
                  Create {category} album
                </button>
              </div>
            ) : (
              renderAlbumGrid(categoryAlbums)
            )}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="albums-page">
      <header className="albums-header">
        <h1>My Albums</h1>
        <button
          className="create-album-btn primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Album
        </button>
      </header>

      {renderCategory(
        'private',
        'Private Albums',
        'No private albums yet. Create an album to start storing your personal memories!'
      )}

      {renderCategory(
        'shared',
        'Shared Albums',
        'No shared albums yet. Create a shared album to collaborate with friends and family!'
      )}

      {renderCategory(
        'public',
        'Public Albums',
        'No public albums yet. Create a public album to share your memories with everyone!'
      )}

      {/* Create album modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Album</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAlbum();
              }}
            >
              <div className="form-group">
                <label htmlFor="album-name">Album Name</label>
                <input
                  type="text"
                  id="album-name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Enter album name"
                  required
                />
              </div>

             <div className="form-group">
               <label htmlFor="album-cover">Album Cover (optional)</label>
               <input
                 type="file"
                 id="album-cover"
                 accept="image/*"
                 onChange={handleCoverChange}
               />
               {coverPreview && (
                 <div style={{ marginTop: 8 }}>
                   <img src={coverPreview} alt="Cover preview" style={{ maxWidth: 180, borderRadius: 6 }} />
                 </div>
               )}
             </div>

              <div className="form-group">
                <label htmlFor="album-privacy">Privacy Setting</label>
                <select
                  id="album-privacy"
                  value={newAlbumPrivacy}
                  onChange={(e) => setNewAlbumPrivacy(e.target.value as 'private' | 'shared' | 'public')}
                >
                  <option value="private">Private - Only you can see</option>
                  <option value="shared">Shared - Share with specific people</option>
                  <option value="public">Public - Everyone can see</option>
                </select>
              </div>

              {createError && <p className="muted" style={{ color: 'red' }}>{createError}</p>}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}