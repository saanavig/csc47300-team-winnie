import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Explore from './pages/Explore';
import Navbar from './components/Navbar';
import PhotoArchive from './pages/PhotoArchive';
import ProjectInfo from './pages/ProjectInfo';
import React from 'react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={<PhotoArchive />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/project" element={<ProjectInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
