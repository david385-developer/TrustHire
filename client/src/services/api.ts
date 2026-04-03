import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trusthire.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trusthire_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trusthire_token');
      localStorage.removeItem('trusthire_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Keep the utility function used for avatar URLs
export const buildAssetUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'https://trusthire.onrender.com/api';
  const baseOrigin = new URL(baseUrl).origin;
  return `${baseOrigin}${path.startsWith('/') ? path : `/${path}`}`;
};

export default api;
