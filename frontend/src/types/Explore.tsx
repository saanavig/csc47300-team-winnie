import React from 'react';
import '../styles/Explore.css';

export default function Explore() {
  return (
    <div className="explore-page">
      <div className="explore-intro">
        <h1>Explore</h1>
        <p className="muted">Discover photos and albums from the community</p>
      </div>
      
      <div className="explore-hero">
        <div className="hero-overlay">
          <h2>Welcome to Explore</h2>
          <p>Browse through public photos and albums shared by our community</p>
        </div>
      </div>
      
      <div className="explore-grid">
        {/* Explore content will be added here */}
      </div>
    </div>
  );
}

