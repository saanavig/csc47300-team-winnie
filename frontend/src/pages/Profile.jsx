import '../styles/Profile.css';

import { useState } from 'react';

export default function Profile() {

    const [profile] = useState({
        name: 'Stuart',
        bio: 'Digital memory keeper. Loves photos, stories, and cats.',
        avatar: 'https://via.placeholder.com/120',
        friends: ['Alice', 'Bob', 'Charlie', 'Dana']
    });

    const [showFriends, setShowFriends] = useState(false);

    const [albums] = useState([
        { title: 'Vacation 2025', cover: 'https://via.placeholder.com/300x200' },
        { title: 'Cats & Dogs', cover: 'https://via.placeholder.com/300x200' },
        { title: 'Graduation', cover: 'https://via.placeholder.com/300x200' }
    ]);

    return (
        <div className="profile-page">
        <div className="profile-header">
            <div className="profile-info">
            <h1>{profile.name}</h1>
            <p>{profile.bio}</p>
            <button onClick={() => setShowFriends(!showFriends)}>
                {showFriends ? 'Hide Friends' : 'Show Friends'}
            </button>
            {showFriends && (
                <ul className="friends-list">
                {profile.friends.map((friend, idx) => (
                    <li key={idx}>{friend}</li>
                ))}
                </ul>
            )}
            </div>
            <div className="profile-avatar">
            <img src={profile.avatar} alt="Profile" />
            </div>
        </div>

        <div className="profile-albums">
            <h2>Albums</h2>
            <div className="albums-grid">
            {albums.map((album, idx) => (
                <div key={idx} className="album-card">
                <img src={album.cover} alt={album.title} />
                <h3>{album.title}</h3>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
}
