import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/auth' });

API.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);
export const refreshToken = (data) => API.post('/token', data);
