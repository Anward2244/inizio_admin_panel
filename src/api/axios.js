import axios from 'axios';

export const BASE_URL = 'https://api.inizio.in';

const api = axios.create({
  baseURL: `${BASE_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };