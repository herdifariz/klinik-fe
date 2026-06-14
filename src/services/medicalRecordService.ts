import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  medications?: string[];
  investigations?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  notes?: string;
  documentUrl?: string;
  createdAt: string;
  patient?: {
    name: string;
    nik: string;
  };
  doctor?: {
    user: {
      name: string;
    };
  };
}

export const medicalRecordService = {
  create: async (data: {
    appointmentId: string;
    patientId: string;
    diagnosis: string;
    treatment: string;
    medications?: string[];
    investigations?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
    notes?: string;
    documentUrl?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>('/medical-records', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<MedicalRecord, 'id' | 'appointmentId' | 'patientId' | 'doctorId' | 'createdAt'>>) => {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    doctorId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>('/medical-records', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
    return response.data;
  },
};
