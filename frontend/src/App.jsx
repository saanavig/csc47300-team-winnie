import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './types/HomePage';
import Albums from './types/Albums';
import PhotoArchive from './types/PhotoArchive';
import Explore from './types/Explore';
import Profile from './types/Profile';
import LoginPage from './types/LoginPage';
import SignupPage from './types/SignupPage';
import Navbar from './components/Navbar';
// import ProjectInfo from './pages/ProjectInfo';
import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import PhotoArchive from './pages/PhotoArchive';
import Profile from './pages/Profile';
import ProjectInfo from './pages/ProjectInfo';
import Explore from './pages/Explore';
import React from 'react';
import LoginPage from './pages/LoginPage';
import AlbumTimeline from './pages/AlbumTimeline';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route  path="/" element={<HomePage />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/album/:albumId" element={<PhotoArchive />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/project" element={<ProjectInfo />} /> */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/album/:id" element={<AlbumTimeline />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
