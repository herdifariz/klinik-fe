import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';

import UsersPage from '../pages/admin/Users';
import PatientsPage from '../pages/admin/Patients';
import MedicinesPage from '../pages/admin/Medicines';
import DoctorsPage from '../pages/admin/Doctors';
import AppointmentsPage from '../pages/admin/Appointments';
import MedicalRecordsPage from '../pages/admin/MedicalRecords';
import PrescriptionsPage from '../pages/admin/Prescriptions';
import PaymentsPage from '../pages/admin/Payments';
import DashboardPage from '../pages/admin/Dashboard';

import { useAuthStore } from '../store/authStore';

// Placeholder Components
const DoctorDashboard = () => <div>Doctor Dashboard</div>;


export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDefaultPath = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }
    switch (user.role) {
      case 'ADMIN':
      case 'STAFF':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';

      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />

      </Route>

      {/* Admin, Staff & Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'DOCTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/patients" element={<PatientsPage />} />
          <Route path="/admin/medicines" element={<MedicinesPage />} />
          <Route path="/admin/doctors" element={<DoctorsPage />} />
          <Route path="/admin/appointments" element={<AppointmentsPage />} />
          <Route path="/admin/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/admin/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/admin/payments" element={<PaymentsPage />} />
          {/* Add more admin routes here */}
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          {/* Add more doctor routes here */}
        </Route>
      </Route>


      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
