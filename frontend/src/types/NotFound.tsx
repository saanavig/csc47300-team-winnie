//Part of Admin Interface
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/button.css';

export function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '1rem'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>404</h1>
      <p style={{ color: '#a0a0a0' }}>Page not found</p>
      <Link to="/" className="btn btn--primary">
        Go to Dashboard
      </Link>
    </div>
  );
}