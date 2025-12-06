//Part of Admin Interface
import React from 'react';
import { Image, FolderOpen, Globe, Lock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { RecentActivity } from '../components/RecentActivity';
import '../styles/StatCard.css';

export function Dashboard() {
  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-header__title">Admin Dashboard</h1>
      </div>

      <div className="stat-cards">
        <StatCard
          label="Total Photos"
          value={1234}
          icon={<Image size={24} />}
          variant="photos"
        />
        <StatCard
          label="Total Albums"
          value={56}
          icon={<FolderOpen size={24} />}
          variant="albums"
        />
        <StatCard
          label="Public Count"
          value={892}
          icon={<Globe size={24} />}
          variant="public"
        />
        <StatCard
          label="Private Count"
          value={342}
          icon={<Lock size={24} />}
          variant="private"
        />
      </div>

      <RecentActivity />
    </Layout>
  );
}