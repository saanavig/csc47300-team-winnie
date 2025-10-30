import "../styles/Profile.css";
import { useState } from "react";

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

  const [showFriends, setShowFriends] = useState(false);

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
        { name: "Hank", avatar: "https://i.pravatar.cc/80?img=27" },      ],
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

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(128);
  const [following] = useState(96);

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
    setFollowers((count) => (isFollowing ? count - 1 : count + 1));
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
                onClick={() => setShowFriends((s) => !s)}
              >
                {showFriends ? "Hide Friends" : "Friends"}
              </button>
            </div>
          </div>

          <ul className="stats-row" aria-label="Profile statistics">
            <li>
              <strong>{albums.length}</strong> posts
            </li>
            <li>
              <strong>{followers}</strong> followers
            </li>
            <li>
              <strong>{following}</strong> following
            </li>
          </ul>

          <section className="bio">
            <p>{profile.bio}</p>
          </section>

          {showFriends && (
            <ul className="friends-list">
              {profile.friends.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="profile-avatar">
          <div className="avatar-wrap" aria-hidden="true" />
          <img
            src={profile.avatar}
            alt={`${profile.name} avatar`}
            className="avatar-img"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-bar" role="tablist" aria-label="Profile sections">
        <button className="tab active" role="tab" aria-selected>
          Albums
        </button>
      </div>

      {/* Albums Grid */}
      <section className="profile-albums">
        <div className="albums-grid">
          {albums.map((album, idx) => (
            <article key={idx} className="album-card" aria-label={album.title}>
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
