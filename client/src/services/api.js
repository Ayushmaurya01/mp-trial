import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear localStorage if not on auth page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  seedDemoData: () => API.post('/auth/seed'),
};

// Subject Service
export const subjectService = {
  getAll: () => API.get('/subjects'),
  getById: (id) => API.get(`/subjects/${id}`),
  create: (data) => API.post('/subjects', data),
  update: (id, data) => API.put(`/subjects/${id}`, data),
  delete: (id) => API.delete(`/subjects/${id}`),
};

// Unit Service
export const unitService = {
  getForSubject: (subjectId) => API.get(`/subjects/${subjectId}/units`),
  create: (subjectId, data) => API.post(`/subjects/${subjectId}/units`, data),
  update: (id, data) => API.put(`/units/${id}`, data),
  delete: (id) => API.delete(`/units/${id}`),
};

// Topic Service
export const topicService = {
  getForUnit: (unitId) => API.get(`/units/${unitId}/topics`),
  create: (unitId, data) => API.post(`/units/${unitId}/topics`, data),
  update: (id, data) => API.put(`/topics/${id}`, data),
  delete: (id) => API.delete(`/topics/${id}`),
};

// Attendance Service
export const attendanceService = {
  getAll: () => API.get('/attendance'),
  update: (id, data) => API.put(`/attendance/${id}`, data),
  quickLog: (data) => API.post('/attendance/log', data),
};

// Lecture Service
export const lectureService = {
  getAll: (subjectId) => API.get('/lectures', { params: { subjectId } }),
  create: (data) => API.post('/lectures', data),
  update: (id, data) => API.put(`/lectures/${id}`, data),
  delete: (id) => API.delete(`/lectures/${id}`),
};

// Assignment Service
export const assignmentService = {
  getAll: (params) => API.get('/assignments', { params }),
  create: (data) => API.post('/assignments', data),
  update: (id, data) => API.put(`/assignments/${id}`, data),
  delete: (id) => API.delete(`/assignments/${id}`),
};

// Progress Service
export const progressService = {
  getOverall: () => API.get('/progress'),
  getSubjectProgress: (subjectId) => API.get(`/progress/${subjectId}`),
};

export default API;
