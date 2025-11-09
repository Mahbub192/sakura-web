import axios, { AxiosResponse, AxiosError } from 'axios';

// Get API URL from environment or use defaults
const getApiUrl = () => {
  // In production, use environment variable or production backend
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: use production backend in production, localhost in development
  if (import.meta.env.PROD) {
    return 'https://sakura-backend-t4mg.onrender.com';
  }
  
  return 'http://localhost:3000';
};

const apiBaseURL = getApiUrl();

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', apiBaseURL);
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
