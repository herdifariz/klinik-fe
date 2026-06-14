import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface PrescriptionItem {
  id?: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  medicine?: {
    name: string;
    code: string;
  };
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  validityDays: number;
  items: PrescriptionItem[];
  createdAt: string;
  patient?: {
    name: string;
  };
  doctor?: {
    user: {
      name: string;
    };
  };
}

export const prescriptionService = {
  create: async (data: {
    appointmentId: string;
    patientId: string;
    notes?: string;
    validityDays?: number;
    items: {
      medicineId: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }[];
  }) => {
    const response = await apiClient.post<ApiResponse<Prescription>>('/prescriptions', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    doctorId?: string;
    status?: 'active' | 'completed' | 'cancelled';
  }) => {
    const response = await apiClient.get<ApiResponse<Prescription[]>>('/prescriptions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return response.data;
  },
};
