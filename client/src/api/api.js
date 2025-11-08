import axios from 'axios';

// Get the base URL for your backend
// Use VITE_API_BASE when provided; otherwise default to your Render backend URL.
const API_BASE = import.meta.env.VITE_API_BASE || 'https://smart-health-appointment-and-dgcd.onrender.com';
// axios will target the '/api' prefix on the backend; keep the '/api' here so callers use paths like '/auth/login'
const API_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// IMPORTANT: This is an interceptor.
// It runs before *every* request you make.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (or your AuthContext)
    // We'll assume your AuthContext stores the token in localStorage
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // If the token exists, add it to the 'Authorization' header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);

export default api;