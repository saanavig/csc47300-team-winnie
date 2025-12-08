//Part of Admin Interface
import React, { useState, useEffect } from 'react';
import { Image, FolderOpen, Globe, Lock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import '../styles/StatCard.css';

interface DashboardStats {
  totalPhotos: number;
  totalAlbums: number;
  publicCount: number;
  privateCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPhotos: 0,
    totalAlbums: 0,
    publicCount: 0,
    privateCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      console.log('Dashboard stats received:', data);
      setStats({
        totalPhotos: Number(data.totalPhotos) || 0,
        totalAlbums: Number(data.totalAlbums) || 0,
        publicCount: Number(data.publicCount) || 0,
        privateCount: Number(data.privateCount) || 0,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchStats();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchStats, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-header__title">Admin Dashboard</h1>
      </div>

      {error && <p style={{ color: 'red', padding: '10px' }}>{error}</p>}

      <div className="stat-cards">
        <StatCard
          label="Total Photos"
          value={stats.totalPhotos}
          icon={<Image size={24} />}
          variant="photos"
        />
        <StatCard
          label="Total Albums"
          value={stats.totalAlbums}
          icon={<FolderOpen size={24} />}
          variant="albums"
        />
        <StatCard
          label="Public Count"
          value={stats.publicCount}
          icon={<Globe size={24} />}
          variant="public"
        />
        <StatCard
          label="Private Count"
          value={stats.privateCount}
          icon={<Lock size={24} />}
          variant="private"
        />
      </div>

      <RecentActivity />
    </Layout>
  );
}