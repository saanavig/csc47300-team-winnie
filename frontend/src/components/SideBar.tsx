//Part of Admin Interface
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image, FolderOpen, Users, LogOut } from 'lucide-react';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/photo-management', label: 'Photos', icon: Image },
  { path: '/admin/album-management', label: 'Albums', icon: FolderOpen },
  { path: '/admin/user-management', label: 'Users', icon: Users },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <h1>{'{Stuart}'}</h1>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                >
                  <Icon className="sidebar__nav-icon" size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}