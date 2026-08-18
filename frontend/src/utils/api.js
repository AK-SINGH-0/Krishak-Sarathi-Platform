import axios from 'axios';

// Base URL of the backend API. Configure in frontend/.env as REACT_APP_API_URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT token (if the user is logged in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ks_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to extract a friendly error message from an axios error
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export default api;
