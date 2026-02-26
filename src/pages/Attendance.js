import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import './Attendance.css';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { notification, showNotification, hideNotification } = useNotification();
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const result = await employeeAPI.getAll();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (err) {
      setError('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedData = {
      employee_id: formData.employee_id.trim(),
      date: formData.date,
      status: formData.status.trim()
    };

    if (!trimmedData.employee_id) {
      setError('Please select an employee');
      return;
    }

    if (!trimmedData.date) {
      setError('Please select a date');
      return;
    }

    const selectedDate = new Date(trimmedData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDate > today) {
      setError('Cannot mark attendance for future dates');
      return;
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (selectedDate < oneYearAgo) {
      setError('Cannot mark attendance for dates older than one year');
      return;
    }

    if (!['Present', 'Absent'].includes(trimmedData.status)) {
      setError('Please select a valid status');
      return;
    }
    
    try {
      const result = await attendanceAPI.mark(trimmedData);
      if (result.success) {
        const message = result.message || 'Attendance marked successfully!';
        showNotification(message, 'success');
        const currentEmployeeId = trimmedData.employee_id;
        setFormData({
          employee_id: currentEmployeeId,
          date: new Date().toISOString().split('T')[0],
          status: 'Present'
        });
        if (currentEmployeeId) {
          fetchAttendance(currentEmployeeId);
          fetchSummary(currentEmployeeId);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const fetchAttendance = async (employeeId) => {
    try {
      setLoading(true);
      const result = await attendanceAPI.getByEmployeeId(employeeId);
      if (result.success) {
        setAttendanceRecords(result.data);
      }
    } catch (err) {
      setError('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (employeeId) => {
    try {
      const result = await attendanceAPI.getSummary(employeeId);
      if (result.success) {
        setSummary(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary');
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      setError('');

      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        if (start > end) {
          setError('Start date cannot be after end date');
          setLoading(false);
          return;
        }
      }

      const result = await attendanceAPI.getFiltered(filters);
      if (result.success) {
        setAttendanceRecords(result.data);
        if (result.data.length === 0) {
          showNotification('No attendance records found for the selected filters', 'info');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to filter attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setFormData({...formData, employee_id: employeeId});
    setFilters({...filters, employeeId});
    if (employeeId) {
      fetchAttendance(employeeId);
      fetchSummary(employeeId);
    } else {
      setAttendanceRecords([]);
      setSummary(null);
    }
  };

  return (
    <div className="page-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      
      <h1>Attendance Management</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="attendance-grid">
        <div className="card">
          <h2>Mark Attendance</h2>
          <form onSubmit={handleSubmit} className="attendance-form">
            <div className="form-group">
              <label>Employee</label>
              <select
                value={formData.employee_id}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employee_id}>
                    {emp.employee_id} - {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <button type="submit" className="btn-submit">Mark Attendance</button>
          </form>

          {summary && (
            <div className="summary-card">
              <h3>Attendance Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Total Present:</span>
                  <span className="summary-value present">{summary.totalPresent}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Absent:</span>
                  <span className="summary-value absent">{summary.totalAbsent}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Records:</span>
                  <span className="summary-value">{summary.totalRecords}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Attendance History</h2>
          
          <div className="filter-section">
            <div className="filter-row">
              <input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="filter-input"
              />
              <input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="filter-input"
              />
              <button onClick={handleFilter} className="btn-filter">
                Filter
              </button>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : attendanceRecords.length === 0 ? (
            <div className="empty-state-small">
              <span className="empty-icon">📋</span>
              <p>Select an employee to view attendance history</p>
            </div>
          ) : (
            <div className="attendance-list">
              {attendanceRecords.map((record) => (
                <div key={record._id} className="attendance-item">
                  <div className="attendance-date">
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                  <div className={`attendance-status ${record.status.toLowerCase()}`}>
                    {record.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
