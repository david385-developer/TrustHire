import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trusthire_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trusthire_token');
      localStorage.removeItem('trusthire_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Keep the utility function used for asset URLs
export const buildAssetUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Extract base origin from VITE_API_URL or fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseOrigin = apiUrl.replace('/api', '');
  
  return `${baseOrigin}${path.startsWith('/') ? path : `/${path}`}`;
};

export default api;
