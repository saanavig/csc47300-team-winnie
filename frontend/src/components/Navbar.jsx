// import './Navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="site-header">
        <div className="user">Stuart</div>
        <nav className="nav">
            <Link to="/" className="nav-button">Home</Link>
            <Link to="/explore" className="nav-button">Explore</Link>
            {/* <Link to="/albums" className="nav-button">My Albums</Link> */}
            <Link to="/profile" className="nav-button">My Profile</Link>
            <Link to="/project" className="nav-button">Our Project</Link>
        </nav>
        </header>
    );
}
