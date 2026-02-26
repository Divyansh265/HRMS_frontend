import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

export const attendanceAPI = {
  mark: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  getByEmployeeId: async (employeeId) => {
    const response = await api.get(`/attendance/${employeeId}`);
    return response.data;
  },

  getFiltered: async (filters) => {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
  },

  getSummary: async (employeeId) => {
    const response = await api.get(`/attendance/summary/${employeeId}`);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get('/attendance/dashboard/summary');
    return response.data;
  },
};
