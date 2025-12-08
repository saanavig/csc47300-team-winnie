import '../styles/Albums.css';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Album } from './index';

export default function Albums() {
  const navigate = useNavigate();
  const location = useLocation();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [expandedCategories, seatExpandedCategories] = useState({ private: true, shared: true, public: true });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumPrivacy, setNewAlbumPrivacy] = useState<'private' | 'shared' | 'public'>('private');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const albumRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // Fetch albums from server
  const fetchAlbums = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/albums/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
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
    } catch (err) {
      console.warn("Error fetching albums:", err);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  useEffect(() => { sessionStorage.setItem('winnieAlbums', JSON.stringify(albums)); }, [albums]);

  // Handle navigation state: open create modal or joined album
  useEffect(() => {
    const navState = (location.state ?? {}) as { openCreate?: boolean; prefillPrivacy?: string; joinedAlbumId?: string };
    if (navState.openCreate) {
      setNewAlbumPrivacy((navState.prefillPrivacy as 'private'|'shared'|'public') ?? 'public');
      setShowCreateModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (navState.joinedAlbumId) {
      // Refresh albums and scroll to joined album
      fetchAlbums().then(() => {
        const ref = albumRefs.current[navState.joinedAlbumId!];
        if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const toggleCategory = (category: 'private' | 'shared' | 'public') => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    setCreateError(null);
    const token = localStorage.getItem('token');

    if (token && coverFile) {
      setCreating(true);
      try {
        const form = new FormData();
        form.append('title', newAlbumName);
        form.append('privacy', newAlbumPrivacy);
        form.append('photos', coverFile, coverFile.name);

        const res = await fetch('http://127.0.0.1:5000/albums/create', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Server returned ${res.status}`);
        }

        const json = await res.json();
        const serverAlbum = json.album;
        const created: Album = {
          id: serverAlbum.id,
          name: serverAlbum.title || newAlbumName,
          coverPhoto: serverAlbum.coverUrl || serverAlbum.photos?.[0] || undefined,
          photoCount: (serverAlbum.photos && serverAlbum.photos.length) || 0,
          privacy: serverAlbum.privacy || newAlbumPrivacy,
          createdAt: serverAlbum.createdAt || new Date().toISOString(),
        };

        setAlbums(prev => [...prev, created]);
        setNewAlbumName(''); setCoverFile(null); setCoverPreview(''); setShowCreateModal(false);
      } catch (err: any) {
        setCreateError(err?.message || 'Failed to create album on server');
      } finally { setCreating(false); }
      return;
    }

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: newAlbumName,
      photoCount: 0,
      privacy: newAlbumPrivacy,
      coverPhoto: coverPreview || undefined,
      createdAt: new Date().toISOString(),
    };
    setAlbums([...albums, newAlbum]);
    setNewAlbumName(''); setCoverFile(null); setCoverPreview(''); setShowCreateModal(false);
  };

  const handleAlbumClick = (albumId: string) => { navigate(`/album/${albumId}`); };

  const getAlbumsByPrivacy = (privacy: 'private' | 'shared' | 'public') => albums.filter(album => album.privacy === privacy);

  const renderAlbumGrid = (categoryAlbums: Album[]) => (
    <div className="albums-grid">
      {categoryAlbums.map(album => (
        <article key={album.id} ref={el => { if(album.id) albumRefs.current[album.id] = el; }} className="album-card" onClick={() => handleAlbumClick(album.id)}>
          {album.coverPhoto ? <img src={album.coverPhoto} alt={album.name} /> : <div className="album-placeholder"><span className="album-icon">📁</span></div>}
          <div className="album-info"><h3>{album.name}</h3><p className="photo-count">{album.photoCount} photos</p></div>
        </article>
      ))}
    </div>
  );

  const renderCategory = (category: 'private' | 'shared' | 'public', title: string, emptyMessage: string) => {
    const categoryAlbums = getAlbumsByPrivacy(category);
    const isExpanded = expandedCategories[category];
    return (
      <section className="album-category">
        <div className="category-header" onClick={() => toggleCategory(category)}>
          <h2><span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>{title} <span className="count">({categoryAlbums.length})</span></h2>
        </div>
        {isExpanded && (
          <div className="category-content">
            {categoryAlbums.length === 0 ? (
              <div className="empty-state">
                <p>{emptyMessage}</p>
                <button className="create-album-btn" onClick={() => { setNewAlbumPrivacy(category); setShowCreateModal(true); }}>
                  Create {category} album
                </button>
              </div>
            ) : renderAlbumGrid(categoryAlbums)}
          </div>
        )}
      </section>
    );
  };

  const token = localStorage.getItem('token');

  return (
    <div className="albums-page">
      {!token ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h1 style={{ marginBottom: '20px' }}>My Albums</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>Please log in to view your albums</p>
          <a href="/login" style={{ 
            display: 'inline-block',
            padding: '12px 30px',
            backgroundColor: '#5858d8',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Go to Login
          </a>
        </div>
      ) : (
        <>
          <header className="albums-header">
            <h1>My Albums</h1>
            <button className="create-album-btn primary" onClick={() => setShowCreateModal(true)}>+ Create New Album</button>
          </header>

          {renderCategory('private', 'Private Albums', 'No private albums yet. Create an album to start storing your personal memories!')}
          {renderCategory('shared', 'Shared Albums', 'No shared albums yet. Create a shared album to collaborate with friends and family!')}
          {renderCategory('public', 'Public Albums', 'No public albums yet. Create a public album to share your memories with everyone!')}
        </>
      )}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create New Album</h2>
            <form onSubmit={e => { e.preventDefault(); handleCreateAlbum(); }}>
              <div className="form-group">
                <label htmlFor="album-name">Album Name</label>
                <input type="text" id="album-name" value={newAlbumName} onChange={e => setNewAlbumName(e.target.value)} placeholder="Enter album name" required />
              </div>

              <div className="form-group">
                <label htmlFor="album-cover">Album Cover (optional)</label>
                <input type="file" id="album-cover" accept="image/*" onChange={handleCoverChange} />
                {coverPreview && <div style={{ marginTop: 8 }}><img src={coverPreview} alt="Cover preview" style={{ maxWidth: 180, borderRadius: 6 }} /></div>}
              </div>

              <div className="form-group">
                <label htmlFor="album-privacy">Privacy Setting</label>
                <select id="album-privacy" value={newAlbumPrivacy} onChange={e => setNewAlbumPrivacy(e.target.value as 'private' | 'shared' | 'public')}>
                  <option value="private">Private - Only you can see</option>
                  <option value="shared">Shared - Share with specific people</option>
                  <option value="public">Public - Everyone can see</option>
                </select>
              </div>

              {createError && <p className="muted" style={{ color: 'red' }}>{createError}</p>}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={creating}>{creating ? 'Creating…' : 'Create Album'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
