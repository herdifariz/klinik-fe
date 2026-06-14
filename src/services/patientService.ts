import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface Patient {
  id: string;
  nik: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  createdAt: string;
}

export const patientService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/patients/${id}`);
    return response.data;
  },
};
