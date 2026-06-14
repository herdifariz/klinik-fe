import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

/**
 * Appointment interface matching backend response structure
 * Backend returns formatted data with patientName and doctorName
 */
export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  reason: string;
  consultationFee?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const appointmentService = {
  create: async (data: {
    doctorId: string;
    patientId?: string;
    appointmentDateTime: string | Date;
    reason: string;
    notes?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>('/appointments/my-appointments');
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: AppointmentStatus;
    doctorId?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params });
    return response.data;
  },

  reschedule: async (id: string, data: { newAppointmentDateTime: string | Date; reason?: string }) => {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  cancel: async (id: string, data: { reason: string }) => {
    const response = await apiClient.delete<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { data });
    return response.data;
  },
};
