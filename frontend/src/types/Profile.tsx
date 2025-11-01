import "../styles/Profile.css";

import { useEffect, useState } from "react";

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
  title: string;
  cover: string;
  contributors: Contributor[];
}

export default function ProfilePage() {
  const [profile] = useState<ProfileType>({
    name: "Stuart",
    bio: "Digital memory keeper. Loves photos, stories, and cats.",
    avatar:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    friends: ["Alice", "Bob", "Charlie", "Dana"],
  });

  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const token = localStorage.getItem("token");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(128);
  const [following] = useState(96);

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
    setFollowers((count) => (isFollowing ? count - 1 : count + 1));
  };

  const fetchFriendData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch friend data:", err);
    }
  };

  useEffect(() => {
    if (showPopup) fetchFriendData();
  }, [showPopup]);

  /** ✅ Safe Add Friend Handler */
  const handleAddFriend = async (username: string): Promise<string> => {
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      let result: any;
      try {
        result = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (res.ok) {
        return result.message || "✅ Friend request sent!";
      } else {
        throw new Error(result.error || "❌ Something went wrong.");
      }
    } catch (err: any) {
      console.error("Add friend error:", err);
      throw new Error(err.message || "❌ Network or server error.");
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-main">
          <div className="name-row">
            <h1 className="profile-name">{profile.name}</h1>
            <div className="header-actions">
              <button
                className={`follow-btn ${isFollowing ? "is-following" : ""}`}
                onClick={toggleFollow}
                aria-pressed={isFollowing}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              <button
                className="secondary-btn"
                onClick={() => setShowPopup("notifications")}
              >
                Notifications
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
              <strong>5</strong> posts
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
            alt={`${profile.name} avatar`}
            className="avatar-img"
          />
        </div>
      </header>

      {/* Popups */}
      {showPopup === "add" && (
        <PopupModal title="Add Friend" onClose={() => setShowPopup(null)}>
          <AddFriendPopup onAdd={handleAddFriend} />
        </PopupModal>
      )}

      {showPopup === "notifications" && (
        <PopupModal title="Friend Requests" onClose={() => setShowPopup(null)}>
          {data?.friendRequests?.incoming?.length ? (
            data.friendRequests.incoming.map((req: string) => (
              <FriendRequestItem key={req} username={req} token={token} />
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </PopupModal>
      )}

      {showPopup === "followers" && (
        <PopupModal title="Followers" onClose={() => setShowPopup(null)}>
          {data?.followers?.length ? (
            data.followers.map((u: string) => <p key={u}>{u}</p>)
          ) : (
            <p>No followers yet</p>
          )}
        </PopupModal>
      )}

      {showPopup === "following" && (
        <PopupModal title="Following" onClose={() => setShowPopup(null)}>
          {data?.following?.length ? (
            data.following.map((u: string) => <p key={u}>{u}</p>)
          ) : (
            <p>Not following anyone</p>
          )}
        </PopupModal>
      )}
    </div>
  );
}

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
      setStatus(err.message || "❌ Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-friend-form" onSubmit={handleSubmit}>
      <label htmlFor="friend-input">Enter username or email:</label>
      <input
        id="friend-input"
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

function FriendRequestItem({
  username,
  token,
}: {
  username: string;
  token: string | null;
}) {
  const handleResponse = async (action: string) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, action }),
      });
      const result = await res.json();
      alert(result.message || result.error);
    } catch (err) {
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
