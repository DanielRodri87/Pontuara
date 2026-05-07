import axios from 'axios';

// Utiliza a porta 7000 conforme definido no docker-compose
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o Bearer Token do Supabase automaticamente nas requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);