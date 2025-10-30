import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Albums.css';
import { Album } from './index';

export default function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [expandedCategories, setExpandedCategories] = useState({
    private: true,
    shared: true,
    public: true,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumPrivacy, setNewAlbumPrivacy] = useState<'private' | 'shared' | 'public'>('private');

  useEffect(() => {
    const savedAlbums = sessionStorage.getItem('winnieAlbums');
    if (savedAlbums) {
      try {
        setAlbums(JSON.parse(savedAlbums));
      } catch (e) {
        console.error('Failed to parse albums:', e);
        setAlbums([]);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('winnieAlbums', JSON.stringify(albums));
  }, [albums]);

  const toggleCategory = (category: 'private' | 'shared' | 'public') => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: newAlbumName,
      photoCount: 0,
      privacy: newAlbumPrivacy,
      createdAt: new Date().toISOString(),
    };

    setAlbums([...albums, newAlbum]);
    setNewAlbumName('');
    setShowCreateModal(false);
  };

  const handleAlbumClick = (albumId: string) => {
    navigate(`/album/${albumId}`);
  };

  const getAlbumsByPrivacy = (privacy: 'private' | 'shared' | 'public') => {
    return albums.filter(album => album.privacy === privacy);
  };

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

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}