
//Part of Admin Interface
import React from 'react';
import '../styles/Badges.css';

type StatusVariant = 'active' | 'pending' | 'rejected';
type PrivacyVariant = 'public' | 'shared' | 'private';

interface BadgeProps {
  variant: StatusVariant | PrivacyVariant;
  children: string;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}`}>
      {children}
    </span>
  );
}