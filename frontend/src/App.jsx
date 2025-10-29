import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Explore from './pages/Explore';
import HomePage from './pages/HomePage';
import LoginPage from './types/LoginPage';
import Navbar from './components/Navbar';
import PhotoArchive from './pages/PhotoArchive';
import Profile from './types/Profile';
import ProjectInfo from './pages/ProjectInfo';
import React from 'react';
import SignupPage from './pages/SignupPage';

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
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
