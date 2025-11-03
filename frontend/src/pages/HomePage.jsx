// import '../styles/HomePage.css';

// import ImageSlider from '../components/ImageSlider'
// import { useState } from 'react';

const slides = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
        caption: "Havana Oh nah nah, half my heart is in havana",
        tags: ["travel", "Havana"],
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1518157770830-df40b281672e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGlnZW9uc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
        caption: "Summer light over linen",
        tags: ["summer", "light"],
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
        caption: "Afternoon still life",
        tags: ["afternoon", "still life"],
    },
];

const albums = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1656608138197-2aea23cc3564?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWxpZW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900",
        title: "Possible Alien Activity",
        tags: ["alien", "sci-fi"],
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1688127346194-30b3c4bdb710?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFtaWx5JTIwYXQlMjBwYXJrfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900",
        title: "Family at the park",
        tags: ["kids", "funny"],
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFrZXVwfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900",
        title: "Makeup is my passion",
        tags: ["abstract", "art"],
    },
];


// export default function HomePage() {
//     const [currentIndex, setCurrentIndex] = useState(0);

//     const prev = () => setCurrentIndex(i => (i === 0 ? slides.length - 1 : i - 1));
//     const next = () => setCurrentIndex(i => (i === slides.length - 1 ? 0 : i + 1));

//     return (
//     <div className="explore-page">

        <h1>Welcome! Take a Peek!</h1>
            <p>Come see what's new and exciting!</p>
            <br></br>

            <h2 className="section-title"> Recent Photos Posted</h2>

//         {/* Slider */}
//         <section className="slider-section">
//         <ImageSlider
//             photos={slides}
//             currentIndex={currentIndex}
//             onPrev={prev}
//             onNext={next}
//         />
//         </section>

//         {/* Albums */}
//         <section className="albums-section">
//         <h2>Recent Albums</h2>

                <div className="albums-grid">
        {albums.map((album) => (
            <div key={album.id} className="album-card">
            <div className="album-image">
                <img src={album.url} alt={album.title} />
                <div className="album-overlay">
                <h3>{album.title}</h3>
                {album.tags && album.tags.length > 0 && (
                    <div className="album-tags">
                    {album.tags.map((tag) => (
                        <span key={tag} className="album-tag">{tag}</span>
                    ))}
                    </div>
                )}
                </div>
            </div>

            <div className="album-members">
                <span className="avatar a1">👥</span>
                <span className="avatar a2">👤</span>
                <span className="avatar a3">👤</span>
            </div>
            </div>
        ))}
        </div>

        </section>
    </div>
);

// }
