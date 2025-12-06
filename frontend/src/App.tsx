import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './types/HomePage';
import Albums from './types/Albums';
import PhotoArchive from './types/PhotoArchive';
import Explore from './types/Explore';
import Profile from './types/Profile';
import LoginPage from './types/LoginPage';
import SignupPage from './types/SignupPage';
import Navbar from './components/Navbar';
import { Layout } from './components/Layout';
import { Dashboard } from './types/Dashboard';
import { AlbumManagement } from './types/AlbumManagement';
import { PhotoManagement } from './types/PhotoManagement';
import { UserManagement } from './types/UserManagement';
import { NotFound } from './types/NotFound';
import "./styles/Global.css";


import PublicProfilePage from "./types/PublicProfilePage";
// import ProjectInfo from './pages/ProjectInfo';
import './App.css';


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
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<Dashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/album-management" element={<AlbumManagement />} />
          <Route path="/admin/photo-management" element={<PhotoManagement />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
    

          <Route path="/users/:username" element={<PublicProfilePage />} /> {/* others */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
