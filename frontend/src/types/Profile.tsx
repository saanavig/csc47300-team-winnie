import "../styles/Profile.css";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import EditProfilePopup from "../components/EditProfilePopup";
import InviteFriendsPopup from "../components/InviteFriendsPopup";
import Notifications from "../components/Notifications";
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
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [albumInvites, setAlbumInvites] = useState<
    { album_id: string; album_title: string; inviter: string }[]
  >([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

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
          const avatarFromServer = p.avatarUrl;
          const resolvedAvatar = avatarFromServer
            ? (typeof avatarFromServer === "string" && avatarFromServer.startsWith("http")
                ? avatarFromServer
                : `http://127.0.0.1:5000${avatarFromServer}`)
            : profile.avatar;
          setProfile((prev) => ({
            ...prev,
            name: p.username || prev.name,
            bio: p.bio ?? prev.bio,
            avatar: resolvedAvatar,
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
        if (res.ok && json.albums) setAlbums(json.albums);
      } catch (err) {
        console.error("Error fetching albums:", err);
      }
    };
    fetchAlbums();
  }, [token]);

  /** Fetch friend counts */
  useEffect(() => {
    if (!token) return;
    const fetchCounts = async () => {
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
        console.error(err);
      }
    };
    fetchCounts();
  }, [token, profile.name]);

  /** Fetch friends and friend requests */
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

  /** Fetch album invites whenever notifications popup opens */
  useEffect(() => {
    if (!token || showPopup !== "notifications") return;
    const fetchAlbumInvites = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/albums/invites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setAlbumInvites(
            (json.invites || []).map((inv: any) => ({
              album_id: inv.album_id,
              album_title: inv.album_title,
              inviter: inv.inviter
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch album invites:", err);
      }
    };
    fetchAlbumInvites();
  }, [token, showPopup]);
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

  /** Accept or decline album invite */
  const handleAlbumInvite = async (albumId: string, action: "accept" | "decline") => {
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/invite/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Something went wrong.");
        return;
      }

      setNotification(result.message);


      // Remove invite from notifications UI
      setAlbumInvites((prev) => prev.filter((inv) => inv.album_id !== albumId));

      // If accepted → refresh album lists so it appears immediately
      if (action === "accept") {
        const res2 = await fetch("http://127.0.0.1:5000/albums/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data2 = await res2.json();

        if (res2.ok && data2.albums) {
          setAlbums(data2.albums);
        }
      }
    } catch (err) {
      console.error("Invite error:", err);
      alert("Network error.");
    }
  };


  /** Toggle follow/unfollow locally */
  const toggleFollow = () => setIsFollowing(prev => !prev);

  /** Follower Row Component */
  function FollowerRow({ username }: { username: string }) {
    const [avatar, setAvatar] = useState<string>("");
    useEffect(() => {
      fetch(`http://127.0.0.1:5000/users/${username}`)
        .then((res) => res.json())
        .then((data) => {
          const raw = data.avatar || data.avatarUrl;
          if (raw) {
            const resolved = (typeof raw === "string" && raw.startsWith("http")) ? raw : `http://127.0.0.1:5000${raw}`;
            setAvatar(resolved);
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

  const handleAlbumClick = (albumId: string) => {
  navigate(`/album/${albumId}`);
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

              {/* Notifications button with red badge */}
              <button
                className="secondary-btn notifications-btn"
                onClick={() => setShowPopup("notifications")}
              >
                Notifications
                {(friendRequests.length + albumInvites.length) > 0 && (
                  <span className="notification-badge">
                    {friendRequests.length + albumInvites.length}
                  </span>
                )}
              </button>

              {/* Add Friend button */}
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
              <span className="clickable" onClick={() => setShowPopup("followers")}>followers</span>
            </li>
            <li>
              <strong>{following}</strong>{" "}
              <span className="clickable" onClick={() => setShowPopup("following")}>following</span>
            </li>
          </ul>

          <section className="bio"><p>{profile.bio}</p></section>
        </div>

        <div className="profile-avatar">
          <img src={profile.avatar} className="avatar-img" alt={`${profile.name}'s avatar`} />
          {profile.name === currentUser && (
            <button className="edit-profile-btn" onClick={() => setShowPopup("editProfile")}>
              Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* Popups */}
      {showPopup === "add" && (
        <PopupModal title="Add Friend" onClose={() => setShowPopup(null)}>
          <AddFriendPopup onAdd={handleAddFriend} />
        </PopupModal>
      )}

      {showPopup === "notifications" && (
        <PopupModal title="Notifications" onClose={() => setShowPopup(null)}>
          {/* Friend Requests */}
          {friendRequests.length ? (
            friendRequests.map((req: string) => (
              <FriendRequestItem
                key={req}
                username={req}
                token={token}
                onRemove={() => setFriendRequests(prev => prev.filter(r => r !== req))}
                setNotifMessage={setNotifMessage}
              />
            ))
          ) : null}
          {/* Album Invites */}
          {albumInvites.length ? (
            albumInvites.map(invite => (
              <div key={invite.album_id} className="notification-item">
                <p><strong>{invite.inviter}</strong> has invited you to {invite.album_title}
                    {/* <span
                      className="clickable-album"
                      style={{color: "darkblue", textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => handleAlbumClick(invite.album_id)}
                      >
                      {invite.album_title}
                    </span> */}
                </p>
                <button onClick={() => handleAlbumInvite(invite.album_id, "accept")}>Accept</button>
                <button onClick={() => handleAlbumInvite(invite.album_id, "decline")}>Decline</button>
              </div>
            ))
          ) : null}
        </PopupModal>
      )}

      {showPopup === "followers" && (
        <PopupModal title="Followers" onClose={() => setShowPopup(null)}>
          {data?.followers?.length ? (
            data.followers.map((u: string) => <FollowerRow key={u} username={u} />)
          ) : <p>No followers yet</p>}
        </PopupModal>
      )}

      {showPopup === "following" && (
        <PopupModal title="Following" onClose={() => setShowPopup(null)}>
          {data?.following?.length ? (
            data.following.map((u: string) => <FollowerRow key={u} username={u} />)
          ) : <p>Not following anyone</p>}
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
                const res = await fetch("http://127.0.0.1:5000/profile/update", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData
                });
                const result = await res.json();
                if (res.ok) {
                  // prefer server-returned values (avatarUrl / bio)
                  let newAvatar = profile.avatar;
                  if (result.avatarUrl) {
                    newAvatar = typeof result.avatarUrl === "string" && result.avatarUrl.startsWith("http")
                      ? result.avatarUrl
                      : `http://127.0.0.1:5000${result.avatarUrl}`;
                  }
                  const newBio = result.bio ?? (formData.get("bio") as string) ?? profile.bio;
                  setProfile(prev => ({ ...prev, bio: newBio, avatar: newAvatar }));
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
        <PopupModal title="Album Update:" onClose={() => setNotification(null)}>
          <p>{notification}</p>
        </PopupModal>
      )}

      {/* Albums */}
      <div className="tabs-bar"><button className="tab active">My Albums</button></div>
      <section className="profile-albums">
      <div className="albums-grid">
        {[...albums].reverse().map((album, idx) => {
          const popupId = `menu-${album.id}`;
          const inviteId = `invite-${album.id}`;
          return (
            <article key={album.id || idx} className="album-card" onClick={() => handleAlbumClick(album.id!)}>
              <div className="album-media">
                <img src={album.cover} alt={album.title} />
                <button
                  className="album-menu-btn"
                  onClick={(e) => { e.stopPropagation(); setShowPopup(popupId); }}
                >⋮</button>
                {showPopup === popupId && (
                  <div className="album-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button className="dropdown-item" onClick={() => setShowPopup(inviteId)}>Invite Friends</button>
                    <button className="dropdown-item delete" onClick={() => alert("Delete album coming soon")}>Delete Album</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>


      {albums.map((album) => {
        const inviteId = `invite-${album.id}`;
        return showPopup === inviteId ? (
          <PopupModal key={inviteId} onClose={() => setShowPopup(null)} title="Invite Friends">
            <InviteFriendsPopup albumId={album.id!} token={token} onClose={() => setShowPopup(null)} />
          </PopupModal>
        ) : null;
      })}
    </div>
  );
}

/** Add Friend Popup */
function AddFriendPopup({ onAdd }: { onAdd: (username: string) => Promise<string> }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true); setStatus(null);
    try { const message = await onAdd(username); setStatus(message); setUsername(""); }
    catch (err: any) { setStatus(err.message); }
    finally { setLoading(false); }
  };
  return (
    <form className="add-friend-form" onSubmit={handleSubmit}>
      <label>Enter username or email:</label>
      <input type="text" placeholder="e.g. johndoe" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Request"}</button>
      {status && <p className="status-message">{status}</p>}
    </form>
  );
}

/** Friend Request Item */
function FriendRequestItem({
  username,
  token,
  onRemove,
  setNotifMessage
}: {
  username: string;
  token: string | null;
  onRemove: () => void;
  setNotifMessage: React.Dispatch<React.SetStateAction<string | null>>;
}) {

  const handleResponse = async (action: string) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username, action }),
      });
      const result = await res.json();

      if (res.ok) {
        // Show message in notifications popup
        setNotifMessage(result.message || "Action successful!");
        setTimeout(() => setNotifMessage(null), 2000); // auto-hide after 2s
        onRemove();
      } else {
        setNotifMessage(result.error || "Something went wrong");
        setTimeout(() => setNotifMessage(null), 2000);
      }

    } catch {
      setNotifMessage("❌ Network error");
      setTimeout(() => setNotifMessage(null), 2000);
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
