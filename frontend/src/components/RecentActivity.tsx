//Part of Admin Interface
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Table.css';
import '../styles/Button.css';

const recentPhotos = [
  { id: 1, thumbnail: 'https://images.unsplash.com/photo-1610375229632-c7158c35a537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW91bnQlMjBmdWppfGVufDB8fDB8fHww', file: 'mountain_sunset.jpg', date: '12/05/2024', user: 'john_doe' },
  { id: 2, thumbnail: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=100&h=100&fit=crop', file: 'ocean_waves.jpg', date: '12/04/2024', user: 'jane_smith' },
  { id: 3, thumbnail: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=100&h=100&fit=crop', file: 'forest_path.jpg', date: '12/03/2024', user: 'mike_wilson' },
  { id: 4, thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop', file: 'city_lights.jpg', date: '12/02/2024', user: 'sarah_jones' },
];

export function RecentActivity() {
  return (
    <div className="table-container">
      <div className="table-header">
        <h3 className="table-header__title">Recent Activity</h3>
        <div className="table-header__actions">
          <Link to="/admin/album-management" className="btn btn--ghost btn--sm">Manage Photos</Link>
          <Link to="/admin/photo-management" className="btn btn--ghost btn--sm">Manage Albums</Link>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>File</th>
            <th>Upload Date</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {recentPhotos.map((photo) => (
            <tr key={photo.id}>
              <td>
                <img 
                  src={photo.thumbnail} 
                  alt={photo.file} 
                  className="table__thumbnail"
                />
              </td>
              <td>{photo.file}</td>
              <td>{photo.date}</td>
              <td>{photo.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}