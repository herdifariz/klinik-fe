import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF';
  createdAt: string;
}

export const userService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: User['role'] }) => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },
};
