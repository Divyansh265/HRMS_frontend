import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className={`hamburger ${isOpen ? 'hidden' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>HRMS</h2>
          <button className="close-btn" onClick={closeMenu} aria-label="Close menu">
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
            onClick={closeMenu}
          >
            <span className="icon">📊</span>
            Dashboard
          </Link>
          <Link 
            to="/employees" 
            className={location.pathname === '/employees' ? 'active' : ''}
            onClick={closeMenu}
          >
            <span className="icon">👥</span>
            Employees
          </Link>
          <Link 
            to="/attendance" 
            className={location.pathname === '/attendance' ? 'active' : ''}
            onClick={closeMenu}
          >
            <span className="icon">📋</span>
            Attendance
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
