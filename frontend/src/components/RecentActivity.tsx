//Part of Admin Interface
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Table.css';
import '../styles/Button.css';

interface Photo {
  id: string;
  thumbnail: string;
  file: string;
  uploadDate: string;
  user: string;
  albumId: string;
  albumTitle: string;
}

export function RecentActivity() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentPhotos = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/recent-photos?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch recent photos');
      }
      const data = await response.json();
      
      // Format the photos for display
      const formattedPhotos = data.photos.map((photo: any) => ({
        id: photo.id,
        thumbnail: photo.thumbnail,
        file: photo.file || 'Unknown',
        uploadDate: photo.uploadDate,
        user: photo.user || 'Unknown',
        albumId: photo.albumId,
        albumTitle: photo.albumTitle,
      }));
      
      setPhotos(formattedPhotos);
      setError(null);
    } catch (err) {
      console.error('Error fetching recent photos:', err);
      setError('Failed to load recent photos');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchRecentPhotos();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchRecentPhotos, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h3 className="table-header__title">Recent Activity</h3>
        <div className="table-header__actions">
          <Link to="/admin/album-management" className="btn btn--ghost btn--sm">Manage Albums</Link>
          <Link to="/admin/photo-management" className="btn btn--ghost btn--sm">Manage Photos</Link>
        </div>
      </div>
      {error && <p style={{ color: 'red', padding: '10px' }}>{error}</p>}
      {loading && <p style={{ padding: '10px' }}>Loading...</p>}
      {!loading && photos.length === 0 && <p style={{ padding: '10px' }}>No photos found</p>}
      {!loading && photos.length > 0 && (
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
            {photos.map((photo) => (
              <tr key={photo.id}>
                <td>
                  <img 
                    src={photo.thumbnail} 
                    alt={photo.file} 
                    className="table__thumbnail"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://via.placeholder.com/80?text=Image';
                    }}
                  />
                </td>
                <td>{photo.file}</td>
                <td>{formatDate(photo.uploadDate)}</td>
                <td>{photo.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}