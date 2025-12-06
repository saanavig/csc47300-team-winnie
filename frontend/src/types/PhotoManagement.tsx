/*Part of Admin Interface*/
import React from 'react';
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badges';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import '../styles/Filters.css';
import '../styles/Table.css';

const photos = [
  { id: 1, thumbnail: 'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0fGVufDB8fDB8fHww', tags: ['nature', 'sunset'], album: 'Landscapes', date: '12/05/2024', status: 'active' as const },
  { id: 2, thumbnail: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=100&h=100&fit=crop', tags: ['ocean', 'blue'], album: 'Travel', date: '12/04/2024', status: 'pending' as const },
  { id: 3, thumbnail: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=100&h=100&fit=crop', tags: ['forest', 'green'], album: 'Nature', date: '12/03/2024', status: 'rejected' as const },
];

export function PhotoManagement() {
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  const handleEdit = (photo: typeof photos[0]) => {
    setSelectedPhoto(photo);
    setEditModal(true);
  };

  const handleDelete = (photo: typeof photos[0]) => {
    setSelectedPhoto(photo);
    setDeleteModal(true);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-header__title">Photo Management</h1>
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
            <option value="">Album</option>
            <option value="landscapes">Landscapes</option>
            <option value="travel">Travel</option>
            <option value="nature">Nature</option>
          </select>
          <select className="select">
            <option value="">Privacy</option>
            <option value="public">Public</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
          </select>
          <select className="select">
            <option value="">Date</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <Button variant="ghost" size="sm">Clear</Button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Tags</th>
              <th>Album</th>
              <th>Date Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((photo) => (
              <tr key={photo.id}>
                <td>
                  <img src={photo.thumbnail} alt="" className="table__thumbnail" />
                </td>
                <td>{photo.tags.join(', ')}</td>
                <td>{photo.album}</td>
                <td>{photo.date}</td>
                <td>
                  <Badge variant={photo.status}>
                    {photo.status.charAt(0).toUpperCase() + photo.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <div className="table__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(photo)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(photo)}>
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
        title="Edit Photo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setEditModal(false)}>Save Changes</Button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Image Source</label>
          <input type="text" className="input" defaultValue={selectedPhoto?.thumbnail} />
        </div>
        <div className="form-group">
          <label className="form-label">Tags</label>
          <input type="text" className="input" defaultValue={selectedPhoto?.tags.join(', ')} />
        </div>
        <div className="form-group">
          <label className="form-label">Album</label>
          <select className="select" style={{ width: '100%' }} defaultValue={selectedPhoto?.album}>
            <option>Landscapes</option>
            <option>Travel</option>
            <option>Nature</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="select" style={{ width: '100%' }} defaultValue={selectedPhoto?.status}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
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
        <p>You are currently going to delete this photo. This will archive the photo (set status to Rejected).</p>
      </Modal>
    </Layout>
  );
}