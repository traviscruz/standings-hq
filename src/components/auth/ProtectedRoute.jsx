import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Ensures that:
 * 1. The user is authenticated (checks localStorage for user_id).
 * 2. The user has the correct role for the section they are trying to access.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  if (!userId) {
    // If not logged in, redirect to login page and save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // If logged in but wrong role, redirect to the user's appropriate dashboard
    const dashboardMap = {
      'Organizer': '/organizer/dashboard',
      'Judge': '/judge/dashboard',
      'Participant': '/participant/dashboard'
    };
    
    const target = dashboardMap[userRole] || '/';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
