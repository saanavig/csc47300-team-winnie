import React from 'react';
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badges';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import '../styles/Filters.css';
import '../styles/Table.css';

const albums = [
  { id: 1, name: 'Landscapes', photoCount: 42, privacy: 'public' as const, date: '12/05/2024' },
  { id: 2, name: 'Travel', photoCount: 28, privacy: 'shared' as const, date: '12/04/2024' },
  { id: 3, name: 'Nature', photoCount: 15, privacy: 'private' as const, date: '12/03/2024' },
];

export function AlbumManagement() {
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<typeof albums[0] | null>(null);

  const handleEdit = (album: typeof albums[0]) => {
    setSelectedAlbum(album);
    setEditModal(true);
  };

  const handleDelete = (album: typeof albums[0]) => {
    setSelectedAlbum(album);
    setDeleteModal(true);
  };

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
          />
        </div>
        <div className="filters__group">
          <select className="select">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="select">
            <option value="">Privacy</option>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
          <select className="select">
            <option value="">Photo Count</option>
            <option value="high">Most Photos</option>
            <option value="low">Least Photos</option>
          </select>
          <Button variant="ghost" size="sm">Clear</Button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.id}>
                <td>{album.name}</td>
                <td>{album.photoCount} photos</td>
                <td>
                  <Badge variant={album.privacy}>
                    {album.privacy.charAt(0).toUpperCase() + album.privacy.slice(1)}
                  </Badge>
                </td>
                <td>{album.date}</td>
                <td>
                  <div className="table__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(album)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(album)}>
                      <Trash2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setDeleteModal(false)}>Confirm</Button>
          </>
        }
      >
        <p>You are currently going to delete "{selectedAlbum?.name}". This will archive the album (set status to Rejected).</p>
      </Modal>
    </Layout>
  );
}