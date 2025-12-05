import "../styles/Explore.css";

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Group {
    id: number;
    title: string;
    desc: string;
    img: string;
    }

    const groups: Group[] = [
    {
        id: 1,
        title: "Hackathons & Beyond",
        desc: "From sleepless nights to standing ovations, share memories from DivHacks, BYTE Hacks, and every idea that took flight.",
        img: "https://cdn.prod.website-files.com/5b3dd54182ecae4d1602962f/609e33e18c5000af6211f094_HR%20Hackathon%20-%20Section%202.jpg",
    },
    {
        id: 2,
        title: "CCNY Chronicles",
        desc: "Candid campus moments, shared smiles, and stories that remind us why we call CCNY home.",
        img: "https://www.ccny.cuny.edu/sites/default/files/styles/large/public/2019-08/fastfacts_fullcampus_.jpg?itok=1FltVbLw",
    },
    {
        id: 3,
        title: "AI & Innovation Lab",
        desc: "Research projects, late-night brainstorming sessions, and our favorite breakthroughs in artificial intelligence.",
        img: "https://www.sacredheart.edu/media/shu-media/school-of-computer-science-amp-engineering/AI-Lab-Robot-350x311.jpg",
    },
    {
        id: 4,
        title: "Women Who Code @ CCNY",
        desc: "Empowering women in tech through hackathons, mentorship, and stories that inspire future changemakers.",
        img: "https://ccny.swe.org/wp-content/uploads/sites/43/2024/09/SWE-CCNY-1024x1024.jpg",
    },
    {
        id: 5,
        title: "Terminal Tales",
        desc: "Every bug has a backstory. Dive into our late-night coding adventures and unforgettable “it finally works!” moments.",
        img: "https://media.istockphoto.com/id/1390410555/photo/asian-programmer-checking-the-operation-of-the-code.jpg?s=612x612&w=0&k=20&c=MlgtE685jjDdbtHyyE7fnBDlLR67CXA6SkPYFdlzbic=",
    },
    {
        id: 6,
        title: "Finals Week Chronicles",
        desc: "Study marathons, library caffeine rituals, and the beautiful chaos of surviving another semester.",
        img: "https://arc-anglerfish-arc2-prod-spectator.s3.amazonaws.com/public/ETN4ACRVAFDCRP2XHPUWDOJNJE.JPG",
    },
    ];

    const Explore: React.FC = () => {
        
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    
    const filteredGroups = useMemo(
    () =>
        groups.filter((g) =>
        (g.title + " " + g.desc).toLowerCase().includes(query.trim().toLowerCase())
        ),
    [query]
    );


    return (
        <main className="explore-page">
        {/* Intro Header */}
        <div className="explore-intro">
            <h1>Explore</h1>
            <p>Welcome to the Explore page! 🎉</p>
            <p>
            Dive into stories, memories, and creative moments shared by the CCNY community.  
            Join public albums, connect with others, and celebrate the moments that make campus life unforgettable.
            </p>
        </div>

        {/* Hero Section */}
        <section className="explore-hero">
            <div className="hero-overlay">
            <h2>You’re Not Just Looking, You’re Belonging 💜</h2>
            <p>Explore the people, projects, and passions that make our college experience unforgettable.</p>
            <button
                className="btn hero-btn"
                onClick={() => {
                    // go to Albums and request the create modal (prefill public)
                    navigate('/albums', { state: { openCreate: true, prefillPrivacy: 'public' } });
                }}
            >         
            Create A Public Album
            </button>
            </div>
        </section>


        <section className="explore-search">
            <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search albums, tags, or descriptions…"
                className="search-input"
                aria-label="Search albums"
                />
            </div>
        </section>


        {filteredGroups.length === 0 && (
        <p className="muted no-results">No matches found.</p>
        )}

        {/* Grid of Cards */}
        <div className="explore-grid">
            {filteredGroups.map((g) => (
            <div key={g.id} className="explore-card">
                <img src={g.img} alt={g.title} className="card-img" />

                <div className="card-body">
                <h2>{g.title}</h2>
                <p className="muted">{g.desc}</p>

                <div className="avatars">
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User 1" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 2" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User 3" />
                    </div>
                </div>


                <button className="btn">Join</button>
                </div>
            </div>
            ))}
        </div>

        {/* Most Viewed Section */}
        <section className="most-viewed">
            <h2>Most Viewed</h2>

            <div className="mv-grid">
            {/* Featured (big left) */}
            <div className="mv-card featured">
                <img
                src="https://hedberg.ccnysites.cuny.edu/talks/SoYouWantToMakeASpaceVideo/img/ccnyplanetarium.jpg"
                alt="Album Name"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>CCNY Nights</h3>
                <div className="avatars">
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User 1" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 2" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User 3" />
                    </div>
                </div>

                </div>
            </div>

            {/* Small top-right */}
            <div className="mv-card small small-top">
                <img
                src="https://www.ccny.cuny.edu/sites/default/files/inline-images/GSOE%20PhDs.png"
                alt="AlbumName"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>Grove School Projects</h3>
                <div className="avatars">
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User 1" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 2" />
                    </div>
                    <div className="avatar">
                        <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User 3" />
                    </div>
                </div>

                </div>
            </div>

            {/* Small bottom-right */}
            <div className="mv-card small small-bottom">
                <img
                src="https://www.ccny.cuny.edu/sites/default/files/2025-04/0402_FAQ_BC.jpg"
                alt="Album Name"
                className="mv-img"
                />
                <div className="mv-meta">
                <h3>Graduation Diaries</h3>
            <div className="avatars">
                <div className="avatar">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User 1" />
                </div>
                <div className="avatar">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 2" />
                </div>
                <div className="avatar">
                    <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User 3" />
                </div>
            </div>

                </div>
            </div>
            </div>
        </section>
        </main>
    );
};

export default Explore;