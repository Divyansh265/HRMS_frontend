import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>HRMS</h2>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          <span className="icon">📊</span>
          Dashboard
        </Link>
        <Link 
          to="/employees" 
          className={location.pathname === '/employees' ? 'active' : ''}
        >
          <span className="icon">👥</span>
          Employees
        </Link>
        <Link 
          to="/attendance" 
          className={location.pathname === '/attendance' ? 'active' : ''}
        >
          <span className="icon">📋</span>
          Attendance
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
