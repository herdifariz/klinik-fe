import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse } from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: add token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle auth, map pagination to meta, and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Map pagination to meta for consistent access
    if (response.data && response.data.pagination) {
      response.data.meta = {
        totalPages: response.data.pagination.pages,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
      };
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Handle 401 Unauthorized
    if (status === 401 && !isLoginRequest && currentPath !== '/login') {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('Access Forbidden: You do not have permission to access this resource');
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn('Resource not found');
    }

    // Handle 500+ Server errors
    if (status && status >= 500) {
      console.error('Server error occurred:', error.response?.data?.message);
    }

    // Log error message from API if available
    if (error.response?.data?.message) {
      console.error('API Error:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
