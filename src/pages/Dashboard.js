import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import Loader from '../components/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const result = await attendanceAPI.getDashboardSummary();
      if (result.success) {
        setSummary(result.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="btn-refresh" onClick={fetchDashboardSummary}>
          ↻ Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{summary?.totalEmployees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{summary?.totalAttendanceRecords || 0}</h3>
            <p>Total Records</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{summary?.presentToday || 0}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <h3>{summary?.absentToday || 0}</h3>
            <p>Absent Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
