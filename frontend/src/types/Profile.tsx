import "../styles/Profile.css";

import { useEffect, useState } from "react";

import EditProfilePopup from "../components/EditProfilePopup";
import { Link } from "react-router-dom";
import PopupModal from "../components/PopupModal";

interface ProfileType {
  name: string;
  bio: string;
  avatar: string;
  
  friends: string[];
}

interface Contributor {
  name: string;
  avatar: string;
}

interface Album {
  id?: string;
  title: string;
  cover: string;
  contributors: Contributor[];
}

export default function ProfilePage() {
  const currentUser = localStorage.getItem("username") || "Stuart";
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState<ProfileType>({
    name: currentUser,
    bio: "",
    avatar:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    friends: [],
  });

  const [albums, setAlbums] = useState<Album[]>([]);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  /** Fetch profile */
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.profile) {
          const p = json.profile;
          setProfile((prev) => ({
            ...prev,
            name: p.username || prev.name,
            bio: p.bio ?? prev.bio,
            avatar: p.avatarUrl ? `http://127.0.0.1:5000${p.avatarUrl}` : prev.avatar,
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  /** Fetch user albums */
  useEffect(() => {
    if (!token) return;

    const fetchAlbums = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/albums/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.albums) {
          setAlbums(json.albums);
        } else {
          console.error("Failed to fetch albums:", json.error);
        }
      } catch (err) {
        console.error("Error fetching albums:", err);
      }
    };

    fetchAlbums();
  }, [token]);

  /** Fetch friend counts */
  useEffect(() => {
    const fetchCounts = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:5000/friends/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setFollowers(json.followers?.length || 0);
          setFollowing(json.following?.length || 0);
          setIsFollowing(json.followers?.includes(currentUser));
        }
      } catch (err) {
        console.error("Error fetching friend counts:", err);
      }
    };
    fetchCounts();
  }, [token, profile.name]);

  /** Fetch friends for popups */
  const fetchFriendData = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
      setFriendRequests(json.friendRequests?.incoming || []);
    } catch (err) {
      console.error("Failed to fetch friend data:", err);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, [token]);

  useEffect(() => {
    if (showPopup) fetchFriendData();
  }, [showPopup]);

  // auto-hides notif after 1.5 seconds
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 1500);
    return () => clearTimeout(t);
  }, [notification]);

  /** Add friend */
  const handleAddFriend = async (username: string): Promise<string> => {
    if (!token) throw new Error("No token");
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (res.ok) return json.message;
      throw new Error(json.error || "❌ Something went wrong.");
    } catch (err: any) {
      throw new Error(err.message || "❌ Network error");
    }
  };

  /** Toggle follow/unfollow locally */
  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  /** Follower Row Component */
  function FollowerRow({ username }: { username: string }) {
    const [avatar, setAvatar] = useState<string>("");

    useEffect(() => {
      fetch(`http://127.0.0.1:5000/users/${username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.avatarUrl) {
            setAvatar(`http://127.0.0.1:5000${data.avatarUrl}`);
          }
        })
        .catch(() => {});
    }, [username]);

    return (
      <Link to={`/users/${username}`} className="follower-item">
        <img src={avatar} className="follower-avatar" />
        <span>{username}</span>
        <span className="arrow">→</span>
      </Link>
    );
  }


  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-main">
          <div className="name-row">
            <h1 className="profile-name">{profile.name}</h1>
            <div className="header-actions">
              {profile.name !== currentUser && (
                <button
                  className={`follow-btn ${isFollowing ? "is-following" : ""}`}
                  onClick={toggleFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
              <button
                className="secondary-btn notifications-btn"
                onClick={() => setShowPopup("notifications")}
              >
                Notifications
                {friendRequests.length > 0 && (
                  <span className="notification-badge">{friendRequests.length}</span>
                )}
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowPopup("add")}
              >
                Add Friend
              </button>
            </div>
          </div>

          <ul className="stats-row">
            <li>
              <strong>{albums.length}</strong> posts
            </li>
            <li>
              <strong>{followers}</strong>{" "}
              <span
                className="clickable"
                onClick={() => setShowPopup("followers")}
              >
                followers
              </span>
            </li>
            <li>
              <strong>{following}</strong>{" "}
              <span
                className="clickable"
                onClick={() => setShowPopup("following")}
              >
                following
              </span>
            </li>
          </ul>

          <section className="bio">
            <p>{profile.bio}</p>
          </section>
        </div>

        <div className="profile-avatar">
          <img
            src={profile.avatar}
            className="avatar-img"
            alt={`${profile.name}'s avatar`}
          />

          {profile.name === currentUser && (
            <button
              className="edit-profile-btn"
              onClick={() => setShowPopup("editProfile")}
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* Popups (Add, Notifications, Followers, Following, Edit Profile) */}
      {showPopup === "add" && (
        <PopupModal title="Add Friend" onClose={() => setShowPopup(null)}>
          <AddFriendPopup onAdd={handleAddFriend} />
        </PopupModal>
      )}
      {showPopup === "notifications" && (
        <PopupModal title="Friend Requests" onClose={() => setShowPopup(null)}>
          {friendRequests.length ? (
            friendRequests.map((req: string) => (
              <FriendRequestItem 
                key={req} 
                username={req} 
                token={token}
                onRemove={() => setFriendRequests(prev => prev.filter(r => r !== req))}
              />
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </PopupModal>
      )}
      {showPopup === "followers" && (
        <PopupModal title="Followers" onClose={() => setShowPopup(null)}>
          {data?.followers?.length ? (
            data.followers.map((u: string) => (
              <FollowerRow key={u} username={u} />
            ))
          ) : (
            <p>No followers yet</p>
          )}
        </PopupModal>
      )}
      {showPopup === "following" && (
        <PopupModal title="Following" onClose={() => setShowPopup(null)}>
          {data?.following?.length ? (
            data.following.map((u: string) => (
              <FollowerRow key={u} username={u} />
            ))
          ) : (
            <p>Not following anyone</p>
          )}
        </PopupModal>
      )}
      {showPopup === "editProfile" && (
        <PopupModal title="Edit Profile" onClose={() => setShowPopup(null)}>
          <EditProfilePopup
            currentAvatar={profile.avatar}
            currentBio={profile.bio}
            onSave={async (formData: FormData) => {
              if (!token) return;
              try {
                const res = await fetch(
                  "http://127.0.0.1:5000/profile/update",
                  { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
                );
                const result = await res.json();
                if (res.ok) {
                  const newAvatarUrl = result.avatarUrl
                    ? "http://127.0.0.1:5000" + result.avatarUrl
                    : profile.avatar;
                  setProfile((prev) => ({
                    ...prev,
                    bio: formData.get("bio") as string,
                    avatar: formData.get("avatar") instanceof File ? newAvatarUrl : prev.avatar,
                  }));
                  setNotification("Profile updated successfully!");
                  setShowPopup(null);
                } else alert(result.error || "Failed to update profile");
              } catch (err) {
                console.error(err);
                alert("Network error while updating profile");
              }
            }}
          />
        </PopupModal>
      )}

      {notification && (
        <PopupModal title="Success" onClose={() => setNotification(null)}>
          <p>{notification}</p>
        </PopupModal>
      )}

      {/* Albums */}
      <div className="tabs-bar">
        <button className="tab active">My Albums</button>
      </div>

      <section className="profile-albums">
        <div className="albums-grid">
          {albums.map((album, idx) => (
            <article key={album.id || idx} className="album-card">
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

/** Add Friend Popup Component */
function AddFriendPopup({ onAdd }: { onAdd: (username: string) => Promise<string> }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const message = await onAdd(username);
      setStatus(message);
      setUsername("");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-friend-form" onSubmit={handleSubmit}>
      <label>Enter username or email:</label>
      <input
        type="text"
        placeholder="e.g. johndoe"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Request"}
      </button>
      {status && <p className="status-message">{status}</p>}
    </form>
  );
}

/** Friend Request Item Component */
function FriendRequestItem({ username, token, onRemove }: { username: string; token: string | null; onRemove: () => void }) {
  const handleResponse = async (action: string) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username, action }),
      });
      const result = await res.json();
      alert(result.message || result.error);
      onRemove();
    } catch {
      alert("❌ Network error.");
    }
  };

  return (
    <div className="friend-request-item">
      <span>{username}</span>
      <button onClick={() => handleResponse("accept")}>Accept</button>
      <button onClick={() => handleResponse("decline")}>Decline</button>
    </div>
  );
}