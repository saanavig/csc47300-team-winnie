import "../styles/Profile.css";

import { useEffect, useState } from "react";

import EditProfilePopup from "../components/EditProfilePopup";
import PopupModal from "../components/PopupModal";
import { Link } from "react-router-dom";



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
  const currentUser = localStorage.getItem("username") || "Stuart";
  const token = localStorage.getItem("token");

  // Use state for profile to allow updates
  const [profile, setProfile] = useState<ProfileType>({
    name: currentUser,          
    bio: "",
    avatar:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    friends: [],
  });

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (res.ok && json.profile) {
          const p = json.profile;
          setProfile((prev) => ({
            ...prev,
            // if you want to DISPLAY username:
            name: p.username || prev.name,
            // or if you want real full name instead, use p.name
            bio: p.bio ?? prev.bio,
            avatar: p.avatarUrl || prev.avatar,
          }));
        } else {
          console.error("Failed to load profile:", json.error);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);



  const [albums] = useState<Album[]>([
    {
      title: "Vacation 2025",
      cover:
        "https://t4.ftcdn.net/jpg/02/65/26/83/360_F_265268314_LmykO3vrtzmh3TQbBdnxj9vUczqqJXCU.jpg",
      contributors: [
        { name: "Alice", avatar: "https://i.pravatar.cc/80?img=5" },
        { name: "Bob", avatar: "https://i.pravatar.cc/80?img=12" },
        { name: "Cara", avatar: "https://i.pravatar.cc/80?img=32" },
      ],
    },
    {
      title: "Cats & Dogs",
      cover:
        "https://media.istockphoto.com/id/1168451046/photo/cat-and-dog-sleeping-puppy-and-kitten-sleep.jpg?s=612x612&w=0&k=20&c=WufdaqZhhwOT6sJFAb6g7-laVoBWaf66XefiWUt44BQ=",
      contributors: [
        { name: "Danny", avatar: "https://i.pravatar.cc/80?img=8" },
        { name: "Eva", avatar: "https://i.pravatar.cc/80?img=20" },
        { name: "Finn", avatar: "https://i.pravatar.cc/80?img=44" },
      ],
    },
    {
      title: "Graduation",
      cover:
        "https://media.istockphoto.com/id/538650431/photo/high-school-or-college-graduate.jpg?s=612x612&w=0&k=20&c=3vd8-sdCVfbMXjU8-BgLcAqC0iZn3ykwyNwhYGFtCpA=",
      contributors: [
        { name: "Hank", avatar: "https://i.pravatar.cc/80?img=27" },
        { name: "Ivy", avatar: "https://i.pravatar.cc/80?img=60" },
      ],
    },
    {
      title: "Student Government",
      cover:
        "https://cap.uncg.edu/wp-content/uploads/2025/03/PIC251209-SGA_SAAC_Spring_Basketball_Tailgate_0481_crop.png",
      contributors: [
        { name: "Gina", avatar: "https://i.pravatar.cc/80?img=15" },
        { name: "Hank", avatar: "https://i.pravatar.cc/80?img=27" },
      ],
    },
    {
      title: "Spotting Our Mascot!",
      cover:
        "https://www.ccny.cuny.edu/sites/default/files/2025-03/Benny_the_Beaver_1050x700.jpg",
      contributors: [
        { name: "Gina", avatar: "https://i.pravatar.cc/80?img=15" },
        { name: "Hank", avatar: "https://i.pravatar.cc/80?img=27" },
        { name: "Ivy", avatar: "https://i.pravatar.cc/80?img=60" },
      ],
    },
  ]);

  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  /** Fetch friend counts + follow status */
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

  /** Fetch followers/following + requests for popups */
  const fetchFriendData = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch friend data:", err);
    }
  };

  useEffect(() => {
    if (showPopup) fetchFriendData();
  }, [showPopup]);

  /** Send friend request */
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
          <img src={profile.avatar} className="avatar-img" alt="avatar" />
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

      {/* Add Friend Popup */}
      {showPopup === "add" && (
        <PopupModal title="Add Friend" onClose={() => setShowPopup(null)}>
          <AddFriendPopup onAdd={handleAddFriend} />
        </PopupModal>
      )}

      {/* Notifications Popup */}
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

      {/* Followers Popup */}
      {showPopup === "followers" && (
        <PopupModal title="Followers" onClose={() => setShowPopup(null)}>
          {data?.followers?.length ? (
            data.followers.map((u: string) => (
              <p key={u}>
                <a href={`/users/${u}`} className="profile-link">{u}</a>
              </p>
            ))
          ) : (
            <p>No followers yet</p>
          )}


        </PopupModal>
      )}

      {/* Following Popup */}
      {showPopup === "following" && (
        <PopupModal title="Following" onClose={() => setShowPopup(null)}>
          {data?.following?.length ? (
            data.following.map((u: string) => (
              <p key={u}>
                <a href={`/users/${u}`} className="profile-link">{u}</a>
              </p>
            ))
          ) : (
            <p>Not following anyone</p>
          )}


        </PopupModal>
      )}

      {/* Edit Profile Popup */}
      {showPopup === "editProfile" && (
        <PopupModal title="Edit Profile" onClose={() => setShowPopup(null)}>
          <EditProfilePopup
          currentAvatar={profile.avatar}
          currentBio={profile.bio}
          onSave={async (newAvatar, newBio) => {
            if (!token) return;

            try {
              const formData = new FormData();
              if (newAvatar instanceof File) {
                formData.append("avatar", newAvatar);
              }
              formData.append("bio", newBio);

              const res = await fetch("http://127.0.0.1:5000/profile/update", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              const result = await res.json();

              if (res.ok) {
                // result.avatarUrl should be something like "/uploads/xyz.jpg"
                const newAvatarUrl =
                  result.avatarUrl
                    ? "http://127.0.0.1:5000" + result.avatarUrl
                    : profile.avatar;

                setProfile((prev) => ({
                  ...prev,             // ✅ spread previous state correctly
                  bio: newBio,
                  avatar: newAvatar instanceof File
                    ? newAvatarUrl     // use the real URL from backend
                    : prev.avatar,
                }));

                alert("Profile updated successfully!");
                setShowPopup(null);
              } else {
                alert(result.error || "Failed to update profile");
              }
            } catch (err) {
              console.error(err);
              alert("Network error while updating profile");
            }
          }}
        />

        </PopupModal>
      )}

      {/* Tabs */}
      <div className="tabs-bar">
        <button className="tab active">Albums</button>
      </div>

      {/* Albums */}
      <section className="profile-albums">
        <div className="albums-grid">
          {albums.map((album, idx) => (
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


/** Add Friend Popup Component */
function AddFriendPopup({
  onAdd,
}: {
  onAdd: (username: string) => Promise<string>;
}) {
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
