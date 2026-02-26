import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import { useNotification } from '../hooks/useNotification';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, employeeId: null, employeeName: '' });
  const { notification, showNotification, hideNotification } = useNotification();
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const result = await employeeAPI.getAll();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedData = {
      employee_id: formData.employee_id.trim(),
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      department: formData.department.trim()
    };

    if (trimmedData.employee_id.length < 3 || trimmedData.employee_id.length > 20) {
      setError('Employee ID must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedData.employee_id)) {
      setError('Employee ID can only contain letters, numbers, dashes, and underscores');
      return;
    }

    if (trimmedData.full_name.length < 2 || trimmedData.full_name.length > 100) {
      setError('Full name must be between 2 and 100 characters');
      return;
    }

    if (!/^[a-zA-Z\s.'-]+$/.test(trimmedData.full_name)) {
      setError('Full name can only contain letters, spaces, dots, hyphens, and apostrophes');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (trimmedData.email.length > 100) {
      setError('Email address is too long (maximum 100 characters)');
      return;
    }

    if (trimmedData.department.length < 2 || trimmedData.department.length > 50) {
      setError('Department name must be between 2 and 50 characters');
      return;
    }
    
    try {
      const result = await employeeAPI.create(trimmedData);
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ employee_id: '', full_name: '', email: '', department: '' });
        showNotification(result.message || 'Employee added successfully!', 'success');
        fetchEmployees();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    }
  };

  const handleDelete = async (id, name) => {
    setConfirmModal({ isOpen: true, employeeId: id, employeeName: name });
  };

  const confirmDelete = async () => {
    const { employeeId } = confirmModal;
    setConfirmModal({ isOpen: false, employeeId: null, employeeName: '' });
    
    try {
      const result = await employeeAPI.delete(employeeId);
      if (result.success) {
        showNotification('Employee deleted successfully!', 'success');
        fetchEmployees();
      }
    } catch (err) {
      showNotification('Failed to delete employee', 'error');
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, employeeId: null, employeeName: '' });
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${confirmModal.employeeName}? This action cannot be undone.`}
      />
      
      <div className="page-header">
        <h1>Employees</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <Loader />
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h3>No employees yet</h3>
          <p>Add your first employee to get started</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(emp._id, emp.full_name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              placeholder="e.g., EMP001"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              title="Only letters, numbers, dashes, and underscores allowed"
              required
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="e.g., John Doe"
              minLength={2}
              maxLength={100}
              pattern="[a-zA-Z\s.'-]+"
              title="Only letters, spaces, dots, hyphens, and apostrophes allowed"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g., john@example.com"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g., Engineering"
              minLength={2}
              maxLength={50}
              required
            />
          </div>
          <button type="submit" className="btn-submit">Add Employee</button>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
