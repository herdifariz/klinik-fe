import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface Medicine {
  id: string;
  code: string;
  name: string;
  category: string;
  dosage: string;
  form: string;
  manufacturer: string;
  stock: number;
  unitPrice: number;
  unit?: string;
  createdAt: string;
}

export const medicineService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<Medicine[]>>('/medicines', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Medicine>>(`/medicines/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<Medicine>>('/medicines', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch<ApiResponse<Medicine>>(`/medicines/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/medicines/${id}`);
    return response.data;
  },
};
