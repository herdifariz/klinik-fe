import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard based on role if not authorized
    const defaultDashboard = 
      user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin/dashboard' :
      user.role === 'DOCTOR' ? '/doctor/dashboard' :
      '/patient/dashboard';
      
    return <Navigate to={defaultDashboard} replace />;
  }

  // Render child routes
  return <Outlet />;
};
