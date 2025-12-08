import '../styles/Filters.css';
import '../styles/Table.css';

import { Edit, Eye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '../components/Badges';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import React from 'react';

interface Album {
  id: string;
  name: string;
  photoCount: number;
  privacy: 'public' | 'shared' | 'private';
  date: string;
  owner: string;
  coverUrl?: string;
}

export function AlbumManagement() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // filters
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [albumFilter, setAlbumFilter] = useState('');
    const [privacyFilter, setPrivacyFilter] = useState('');
    const [dateSort, setDateSort] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/admin/albums?limit=10');
      if (!response.ok) throw new Error('Failed to fetch albums');
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (album: Album) => {
    setSelectedAlbum(album);
    setEditModal(true);
  };

  const handleDelete = (album: Album) => {
    setSelectedAlbum(album);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAlbum) return;
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`http://127.0.0.1:5000/albums/${selectedAlbum.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        // remove from current list
        setAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id));
        setDeleteModal(false);
        setSelectedAlbum(null);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to archive album', err);
        // fallback to removing locally if server rejects (optional)
        setAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id));
        setDeleteModal(false);
        setSelectedAlbum(null);
      }
    } catch (error) {
      console.error('Network error archiving album:', error);
      // still remove locally for UX
      setAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id));
      setDeleteModal(false);
      setSelectedAlbum(null);
    }
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
    } catch {
      return isoDate;
    }
  };


  const filteredAlbums = albums
  .filter(album => {
    const matchesSearch = searchText
      ? album.name.toLowerCase().includes(searchText.toLowerCase())
      : true;

    // const matchesStatus = statusFilter
    //   ? album.photoCount.toString() === statusFilter // optional, or skip if not applicable
    //   : true;

    const matchesAlbum = albumFilter
      ? album.name.toLowerCase() === albumFilter.toLowerCase()
      : true;

    const matchesPrivacy = privacyFilter
      ? album.privacy === privacyFilter
      : true;

    return matchesSearch && matchesAlbum && matchesPrivacy;
  })
  .sort((a, b) => {
    if (dateSort === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateSort === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    return 0;
  });

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-header__title">Album Management</h1>
      </div>

            <div className="filters">
              <div className="filters__search">
                <input
                  type="text"
                  className="input"
                  placeholder="Search (titles/tags)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="filters__group">
                <select 
                  className="select"
                  value={privacyFilter}
                  onChange={(e) => setPrivacyFilter(e.target.value)}
                >
                  <option value="">Privacy</option>
                  <option value="public">Public</option>
                  <option value="shared">Shared</option>
                  <option value="private">Private</option>
                </select>
                <select
                  className="select"
                  value={dateSort}
                  onChange={(e) => setDateSort(e.target.value)}
                >
                  <option value="">Date</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchText('');
                    setStatusFilter('');
                    setAlbumFilter('');
                    setPrivacyFilter('');
                    setDateSort('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Album Name</th>
              <th>Photo Count</th>
              <th>Privacy</th>
              <th>Date Created</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Loading albums...
                </td>
              </tr>
            ) : filteredAlbums.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  No albums found
                </td>
              </tr>
            ) : (
              filteredAlbums.map((album) => (
                <tr key={album.id}>
                  <td>{album.name}</td>
                  <td>{album.photoCount} photos</td>
                  <td>
                    <Badge variant={album.privacy}>
                      {album.privacy.charAt(0).toUpperCase() + album.privacy.slice(1)}
                    </Badge>
                  </td>
                  <td>{formatDate(album.date)}</td>
                  <td>{album.owner}</td>
                  <td>
                    <div className="table__actions" style={{ justifyContent: 'center' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(album)}>
                        <Trash2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.location.href = `http://localhost:5173/users/${album.owner}`}>
                        <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Album"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setEditModal(false)}>Save Changes</Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Album Name</label>
          <input type="text" className="input" defaultValue={selectedAlbum?.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Privacy</label>
          <select className="select" style={{ width: '100%' }} defaultValue={selectedAlbum?.privacy}>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cover Photo URL</label>
          <input type="text" className="input" placeholder="Enter cover photo URL" />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)} style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Confirm</Button>
          </>
        }
      >
        <p>You are currently going to delete "{selectedAlbum?.name}". This will archive the album.</p>
      </Modal>
    </Layout>
  );
}