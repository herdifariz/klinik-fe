import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface Doctor {
  id: string;
  userId: string;
  specialty: string;
  experience: number;
  biography?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export const doctorService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; specialty?: string }) => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return response.data;
  },

  getAvailableSlots: async (id: string, date: string) => {
    const response = await apiClient.get<ApiResponse<{ slots: string[] }>>(`/doctors/${id}/available-slots`, { params: { date } });
    return response.data;
  },
};
