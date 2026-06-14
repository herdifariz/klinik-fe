import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/api';

export interface RevenueReportData {
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  netRevenue: number;
  byDate: {
    date: string;
    amount: number;
    count: number;
  }[];
}

export interface AppointmentReportData {
  totalAppointments: number;
  scheduledCount: number;
  completedCount: number;
  cancelledCount: number;
  byDoctor: {
    doctorId: string;
    doctorName: string;
    count: number;
  }[];
}

export interface PatientReportData {
  totalRegistered: number;
  newPatients: number;
  byGender: {
    gender: string;
    count: number;
  }[];
  byAgeGroup: {
    group: string;
    count: number;
  }[];
}

export const reportService = {
  getRevenueReport: async (startDate: string, endDate: string): Promise<RevenueReportData> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/revenue', { params: { startDate, endDate } });
    const raw = response.data.data;
    return {
      totalRevenue: raw.summary?.totalRevenue || 0,
      totalDiscount: 0,
      totalTax: 0,
      netRevenue: raw.summary?.totalRevenue || 0,
      byDate: (raw.dailyBreakdown || []).map((item: any) => ({
        date: item.date,
        amount: item.revenue,
        count: item.paymentCount,
      })),
    };
  },

  getAppointmentReport: async (startDate: string, endDate: string): Promise<AppointmentReportData> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/appointments', { params: { startDate, endDate } });
    const raw = response.data.data;
    return {
      totalAppointments: raw.summary?.totalAppointments || 0,
      scheduledCount: (raw.summary?.scheduled || 0) + (raw.summary?.rescheduled || 0),
      completedCount: raw.summary?.completed || 0,
      cancelledCount: raw.summary?.cancelled || 0,
      byDoctor: (raw.byDoctor || []).map((doc: any) => ({
        doctorId: doc.doctorId,
        doctorName: doc.doctorName,
        count: doc.totalAppointments,
      })),
    };
  },

  getPatientReport: async (startDate: string, endDate: string): Promise<PatientReportData> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/patients', { params: { startDate, endDate } });
    const raw = response.data.data;
    return {
      totalRegistered: raw.summary?.totalPatients || 0,
      newPatients: raw.summary?.newPatients || 0,
      byGender: [],
      byAgeGroup: (raw.byAge || []).map((item: any) => ({
        group: item.ageRange,
        count: item.count,
      })),
    };
  },
};
