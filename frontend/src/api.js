import axios from 'axios';
import API_BASE_URL from './config/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyai_token_v3');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
export { API_BASE_URL };
