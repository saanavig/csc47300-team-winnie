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


function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route  path="/" element={<HomePage />} />
          <Route path="/albums" element={<PhotoArchive />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project" element={<ProjectInfo />} />
          <Route path="/login" element={<LoginPage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
