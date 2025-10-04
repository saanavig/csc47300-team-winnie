import './App.css'
import './main.css';

import PhotoArchive from './pages/PhotoArchive'
import { useState } from 'react'

const slides = [
  {
    src: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
    caption: "Havana Oh nah nah, half my heart is in havana",
  },
  {
    src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
    caption: "Summer light over linen",
  },
  {
    src: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    caption: "Afternoon still life",
  },
];

const albums = [
  {
    title: "Aliens stole my home",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Children are Terrifying",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Troeger",
    cover:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
  },
];


function App() {
  const [count, setCount] = useState(0)
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIdx(i => (i === slides.length - 1 ? 0 : i + 1));
  const [showProject, setShowProject] = useState(false);


  return (
    <div className="app-container">
      <PhotoArchive />
    </div>
  )
}

export default App;