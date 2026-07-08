import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL from environment variable
const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle 403 Forbidden
      if (status === 403) {
        toast.error('Access denied');
      }

      // Handle 404 Not Found
      if (status === 404) {
        toast.error(data.message || 'Resource not found');
      }

      // Handle 500 Server Error
      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }

      // Handle other errors
      if (data.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API wrapper functions
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
    },
  },

  // Summary endpoints
  summaries: {
    getAll: () => api.get('/summaries'),
    getById: (id) => api.get(`/summaries/${id}`),
    create: (data) => api.post('/summaries', data),
    update: (id, data) => api.put(`/summaries/${id}`, data),
    delete: (id) => api.delete(`/summaries/${id}`),
    getStats: () => api.get('/summaries/stats'),
    
    // AI generation
    generateAI: (data) => api.post('/summaries/generate', data),
    
    // Async job queue
    queueJob: (data) => api.post('/summaries/queue', data),
    getJobStatus: (jobId) => api.get(`/summaries/job/${jobId}`),
    getQueueStats: () => api.get('/summaries/queue/stats'),
  },
};

export default api;
