// Central API configuration for local and cloud deployment
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081';
export const MAIN_API_URL = import.meta.env.VITE_MAIN_API_URL || 'http://localhost:8082';
