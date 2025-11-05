// Protected Route Component for Role-Based Access Control

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Permission } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  allowedRoles 
}) => {
  const { user, hasPermission } = useUser();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If specific permission is required, check it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '48px',
          opacity: 0.5
        }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
          You don't have permission to access this page. Please contact your administrator if you need access.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '16px',
            padding: '8px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '48px',
          opacity: 0.5
        }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
          This page is restricted to specific roles. Your current role ({user.role}) does not have access.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '16px',
            padding: '8px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

