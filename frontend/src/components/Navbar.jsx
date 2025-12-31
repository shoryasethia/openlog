import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Code2 } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="OpenLog" className="nav-logo" />
            <span className="nav-title">OpenLog</span>
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Activity size={18} />
              <span>Status</span>
            </Link>
            <Link
              to="/analytics"
              className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </Link>
            <Link
              to="/developer"
              className={`nav-link ${isActive('/developer') ? 'active' : ''}`}
            >
              <Code2 size={18} />
              <span>Developer</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
