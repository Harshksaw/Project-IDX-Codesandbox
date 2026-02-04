import axios from 'axios';

// In production (empty VITE_BACKEND_URL), use relative URLs (nginx proxy)
// In development, use the full backend URL
const baseURL = import.meta.env.VITE_BACKEND_URL || '';

const axiosInstance = axios.create({
    baseURL
});

export default axiosInstance;

// Helper to get WebSocket URL for terminal (port 50003)
export const getWebSocketURL = (path) => {
    if (import.meta.env.VITE_TERMINAL_URL) {
        // Development: use terminal WebSocket URL
        const url = new URL(import.meta.env.VITE_TERMINAL_URL);
        return `ws://${url.host}${path}`;
    }
    // Production: use current host (nginx proxy)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${path}`;
};

// Helper to get Socket.io URL
export const getSocketIOURL = () => {
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }
    // Production: use current origin (nginx proxy)
    return window.location.origin;
};