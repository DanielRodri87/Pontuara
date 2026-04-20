import axios from 'axios';

// Default to 8000 since FastAPI typically runs there
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach tokens if needed
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
