import "../styles/HomePage.css";

import ImageSlider from "../components/ImageSlider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Slide {
    id: number;
    url: string;
    caption: string;
    tags: string[];
    }

    interface Album {
    id: number;
    url: string;
    title: string;
    tags?: string[];
    }

    type UserComment = { 
        id: number;
        author: string;
        text: string;
        date: string;
        avatarUrl?: string; 
    };


    const slides: Slide[] = [
    {
        id: 1,
        url: "https://images.squarespace-cdn.com/content/v1/5af5f71c0dbda32cd6252624/1581193927666-Q1K4BAD27E75GBQFA26J/AdobeStock_317434149+heart+shaped+pizza.jpeg",
        caption: "Nothing Like A Home Cooked Meal",
        tags: ["Home Cooked Meal", "Ingredients", "Messy Kitchen", "Friday Night In"],
    },
    {
        id: 2,
        url: "https://images.alphacoders.com/683/thumb-1920-683731.jpg",
        caption: "Summer Light over Linen",
        tags: ["The Beautiful Sunset", "Summer", "Linen"],
    },
    {
        id: 3,
        url: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437053/796070/main-image",
        caption: "Afternoon Still Life",
        tags: ["Afternoon", "Still Life", "Painting"],
    },
    {
        id: 4,
        url: "https://i.ytimg.com/vi/l4UBqr3Z6r8/maxresdefault.jpg",
        caption: "Switzerland Trip!",
        tags: ["Switzerland","Summer 2025", "Photography", "Family Travel"],
    },
    {
        id: 5,
        url: "https://cdn.fondecranvip.com/2025/09/heKHMOND-fond-decran-Bonhomme-de-neige-27.webp",
        caption: "Christmas Holidays - First Snow",
        tags: ["Merry Christmas", "Winter Time", "Snow"],
    },
    {
        id: 6,
        url: "https://wallpaper.forfun.com/fetch/7a/7a3bbab6fd3f4ec1f68b1fa5678d8bb4.jpeg",
        caption: "",
        tags: ["Brunch with Friends", "Central Park", "Sunny Day"],
    },
    {
        id: 7,
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGlraW5nfGVufDB8fDB8fHww",
        caption: "",
        tags: ["Hiking", "Beautiful Landscape", "Mountains"],
    },
    ];

    const albums: Album[] = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "Notes for CSC 473!",
        tags: ["typescript", "javascript"],
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "GSOE Expo 2025",
        tags: ["engineering", "projects"],
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
        title: "Fall 2025 Club Fair!",
        tags: ["snacks", "clubs"],
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop",
        title: "CCNY Freshmen Orientation",
        tags: ["freshmen", "friends", "ccny"],
    },
    ];

    const initialComments: UserComment[] = [
        { 
            id: 3, 
            author: "Saanavi", 
            text: "Love the lighting in these shots!", 
            date: "Oct 26, 2025",
            avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
        },
        { 
            id: 2, 
            author: "Stuart",  
            text: "This album makes me miss summer ☀️", 
            date: "Oct 25, 2025",
            avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
        },
        { 
            id: 1, 
            author: "Sam",     
            text: "Can you upload the raw files too?",  
            date: "Oct 24, 2025",
            avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
        },
    ];

    const YOU_AVATAR ="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop";

    function avatarInitial(name: string) {
        return name.trim().charAt(0).toUpperCase() || "U";
    }


    export default function HomePage() {
      const [currentIndex, setCurrentIndex] = useState<number>(0);
      const [comments, setComments] = useState<UserComment[]>(initialComments);
      const [commentText, setCommentText] = useState("");
      const navigate = useNavigate();

      // Ensure a placeholder album exists in sessionStorage (frontend-only).
      // This lets clicking a sample album navigate to /album/:id and reuse PhotoArchive logic.
      function openAlbum(album: Album) {
        const id = String(album.id);
        try {
          const saved = sessionStorage.getItem("winnieAlbums");
          const albums = saved ? JSON.parse(saved) : [];
          const exists = albums.find((a: any) => a.id === id);
          if (!exists) {
            albums.push({
              id,
              name: album.title || `Album ${id}`,
              coverPhoto: album.url,
              photoCount: 0,
              privacy: "public",
              createdAt: new Date().toISOString(),
            });
            sessionStorage.setItem("winnieAlbums", JSON.stringify(albums));
          }
        } catch {
          // ignore storage errors — navigation still proceeds
        }
        navigate(`/album/${id}`);
      }

      const prev = () =>
          setCurrentIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
      const next = () =>
          setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

      function submitComment(e: React.FormEvent<HTMLFormElement>) {
          e.preventDefault();
          const text = commentText.trim();
          if (!text) return;

          setComments((prev) => [
          {
              id: (prev[0]?.id ?? 0) + 1,
              author: "You",
              text,
              date: new Date().toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              }),
              avatarUrl: YOU_AVATAR,
          },
          ...prev,
          ]);
          setCommentText("");
      }

      return (
          <div className="home-page">
          <h1>Welcome to Winnie Memory Archive!</h1>
          <p>Capture, organize, and revisit the moments that matter. Keep full
            control with per-photo privacy, smart tags, and shareable groups so
            your memories look great and stay yours.</p>
          <br />

          <h2 className="section-title">&lt;Group Name&gt; Recent Photos Posted</h2>

          {/* Slider */}
          <section className="slider-section">
              <ImageSlider
              photos={slides}
              />
          </section>
          <br />

          {/* Albums */}
          <section className="albums-section">
              <h2>Recent Albums</h2>

              <div className="albums-grid">
              {albums.map((album) => (
                  <div
                    key={album.id}
                    className="album-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openAlbum(album)}
                    onKeyDown={(e) => { if (e.key === "Enter") openAlbum(album); }}
                    style={{ cursor: "pointer" }}
                  >
                   <div className="album-media">
                     <img src={album.url} alt={album.title} />
                     <div className="album-hover">
                      <span className="hover-text">View album →</span>
                     </div>
                   </div>

                   <div className="album-body">
                      <h3 className="album-title">{album.title}</h3>

                      <div className="album-members" aria-label="Album members">
                      <span className="avatar a1" aria-hidden="true">👥</span>
                      <span className="avatar a2" aria-hidden="true">👤</span>
                      <span className="avatar a3" aria-hidden="true">👤</span>
                      </div>

                      {album.tags?.length ? (
                      <div className="album-tags">
                          {album.tags.map((tag) => (
                          <span key={tag} className="album-tag">#{tag}</span>
                          ))}
                      </div>
                      ) : null}
                  </div>
                  </div>
              ))}
              </div>

          </section>

          <section className="album-detail container">
          <h2 className="detail-title">
              <br />
            &lt;User&gt; Album Name <span className="muted">(old)</span>
          </h2>

          <div className="detail-layout">
            {/* Left: comments */}
            <div className="detail-comments">
              <h3 className="comments-heading">
                Comments <span className="count">({comments.length})</span>
              </h3>

              <div className="comment-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment">
                    <div className="avatar-wrap" aria-hidden="true">
                      <img
                      className="avatar-img"
                      src={c.avatarUrl || YOU_AVATAR}
                      alt={`${c.author} avatar`}
                      loading="lazy"
                      />
                  </div>
                    <div className="comment-content">
                      <div className="comment-meta">
                        <span className="author">{c.author}</span>
                        <span className="date">{c.date}</span>
                      </div>
                      <p className="comment-body">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form className="comment-form" onSubmit={submitComment} aria-label="Add a comment">
                <label className="sr-only" htmlFor="new-comment">
                          
                </label>
                <textarea
                  id="new-comment"
                  className="comment-input"
                  placeholder="Write a comment…"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button className="btn comment-btn" type="submit">
                  Comment
                </button>
              </form>
            </div>

            {/* Right: large album image */}
            <div className="detail-image">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop"
                alt="Album hero"
              />
            </div>
          </div>
        </section>

          
          </div>
      );
    }
