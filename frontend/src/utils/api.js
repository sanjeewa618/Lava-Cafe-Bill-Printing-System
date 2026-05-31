import axios from 'axios';

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
