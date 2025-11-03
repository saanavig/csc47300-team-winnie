import '../styles/Profile.css';

import { useState } from 'react';

export default function Profile() {

    const [profile] = useState({
        name: 'Stuart',
        bio: 'Digital memory keeper. Loves photos, stories, and cats.',
        avatar: 'https://images.unsplash.com/photo-1606118858477-9a8f9dfb257a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmF0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900',
        friends: ['Alice', 'Bob', 'Charlie', 'Dana']
    });

    const [showFriends, setShowFriends] = useState(false);

    const [albums] = useState([
        { title: 'Vacation 2025', cover: 'https://images.unsplash.com/photo-1550399504-8953e1a6ac87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900' },
        { title: 'Cats & Dogs', cover: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0cyUyMGFuZCUyMGRvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' },
        { title: 'Graduation', cover: 'https://images.unsplash.com/photo-1623461487986-9400110de28e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JhZHVhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' }
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
