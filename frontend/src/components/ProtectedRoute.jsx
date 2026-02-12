import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 1. Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  // 2. If no token, kick them back to the Login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 3. If token exists, let them see the page
  return children;
};

export default ProtectedRoute;