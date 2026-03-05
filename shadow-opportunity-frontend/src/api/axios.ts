import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales (ej: 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isPublicPage = window.location.pathname.includes('public-ticket') ||
            window.location.pathname.includes('publicticket') ||
            window.location.pathname.includes('login');

        if (error.response?.status === 401 && !isPublicPage) {
            localStorage.removeItem('auth-token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Instancia pública SIN token ni interceptor de redirección
// Usada para endpoints que no requieren autenticación
export const publicApi = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
