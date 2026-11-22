import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token and guest session token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickpick_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let sessionToken = localStorage.getItem('quickpick_session_token');
    if (!sessionToken) {
      sessionToken = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('quickpick_session_token', sessionToken);
    }
    config.headers['x-session-token'] = sessionToken;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default api;
