import "../styles/Profile.css";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Contributor {
  name: string;
  avatar: string;
}

interface Album {
  title: string;
  cover: string;
  contributors: Contributor[];
}

interface PublicProfileType {
  name: string;
  username: string;
  bio: string;
  avatar: string;     
  avatarUrl?: string;
  followers: number;
  following: number;
  albums: Album[];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("username");

  const [profile, setProfile] = useState<PublicProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/users/${encodeURIComponent(username)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) {
          setError("User not found.");
          setProfile(null);
        } else {
          const data = await res.json();
          
          const fixedAvatar = data.avatarUrl
            ? (typeof data.avatarUrl === "string" && data.avatarUrl.startsWith("http")
                ? data.avatarUrl
                : `http://127.0.0.1:5000${data.avatarUrl}`)
            : "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=600&auto=format&fit=crop";

        setProfile({
          ...data,
          avatar: fixedAvatar,
          albums: data.albums.map((a: any) => ({
            title: a.title,
            cover: a.coverUrl || "",
            contributors: [],   // backend doesn’t support collaborators yet
          })),
        });



          setIsFollowing(data.isFollowing ?? false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username, token]);

  const handleAddFriend = async () => {
    if (!token || !profile) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: profile.username }),
      });
      const json = await res.json();
      alert(json.message || json.error);
    } catch {
      alert("Network error");
    }
  };

  if (loading) return <div className="profile-page">Loading…</div>;
  if (error || !profile) return <div className="profile-page">{error}</div>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-main">
          <div className="name-row">
            <h1 className="profile-name">{profile.name}</h1>
            <div className="header-actions">
              {profile.username !== currentUser && (
                <>
                  <button
                    className={`follow-btn ${isFollowing ? "is-following" : ""}`}
                    onClick={() => setIsFollowing((prev) => !prev)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="secondary-btn" onClick={handleAddFriend}>
                    Add Friend
                  </button>
                </>
              )}
            </div>
          </div>

          <ul className="stats-row">
            <li>
              <strong>{profile.albums.length}</strong> posts
            </li>
            <li>
              <strong>{profile.followers}</strong> followers
            </li>
            <li>
              <strong>{profile.following}</strong> following
            </li>
          </ul>

          <section className="bio">
            <p>{profile.bio}</p>
          </section>
        </div>

        <div className="profile-avatar">
          <img
            src={profile.avatar} 
            alt={`${profile.username}'s avatar`}
            className="avatar-img"
          />
        </div>
      </header>

      <div className="tabs-bar">
        <button className="tab active">Albums</button>
      </div>

      <section className="profile-albums">
        <div className="albums-grid">
          {profile.albums.map((album, idx) => (
            <article key={idx} className="album-card">
              <div className="album-media">
                <img src={album.cover} alt={album.title} />
              </div>
              <div className="album-meta">
                <h3 className="album-title">{album.title}</h3>
                <div className="album-avatars">
                  {album.contributors.slice(0, 3).map((c, i) => (
                    <img
                      key={i}
                      src={c.avatar}
                      alt={c.name}
                      title={c.name}
                      className="album-avatar"
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
