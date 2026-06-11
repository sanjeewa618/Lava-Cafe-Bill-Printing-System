import axios from 'axios';

// For local development: auto-insert a dev JWT if none exists so the UI can
// load protected endpoints without manual login. This is safe for local use
// only. Replace or remove the token for production.
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgxMTU3MjE4LCJleHAiOjE3ODE3NjIwMTh9.6ukA40rvrt_2cKGHKGVNFHnDjx9kpO8s2ngn_aFWos4';
if (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')) {
  if (!localStorage.getItem('lava_cafe_token')) {
    localStorage.setItem('lava_cafe_token', DEV_TOKEN);
    console.info('Dev JWT inserted into localStorage (dev only)');
  }
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lava_cafe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lava_cafe_token');
      localStorage.removeItem('lava_cafe_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
