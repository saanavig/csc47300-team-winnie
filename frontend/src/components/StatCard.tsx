//Part of Admin Interface
import React from 'react';
import { ReactNode } from 'react';
import '../styles/StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant: 'photos' | 'albums' | 'public' | 'private';
}

export function StatCard({ label, value, icon, variant }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${variant}`}>
        {icon}
      </div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}