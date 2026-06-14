import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INSURANCE';

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  discountAmount: number;
  discountReason?: string;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  transactionId?: string;
  referenceNumber?: string;
  paidAmount?: number;
  createdAt: string;
  patient?: {
    name: string;
    nik: string;
  };
}

export const paymentService = {
  create: async (data: {
    appointmentId: string;
    patientId: string;
    amount: number;
    discountAmount?: number;
    discountReason?: string;
    taxAmount?: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return response.data;
  },

  confirm: async (id: string, data: {
    transactionId: string;
    referenceNumber?: string;
    paidAmount?: number;
    notes?: string;
  }) => {
    const response = await apiClient.put<ApiResponse<Payment>>(`/payments/${id}/confirm`, data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    patientId?: string;
    appointmentId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<Payment[]>>('/payments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data;
  },
};
