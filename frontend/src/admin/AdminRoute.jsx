import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F6F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Archivo, sans-serif'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2.5px solid #E5E7EB',
          borderTopColor: '#0A0A0A',
          borderRadius: '50%',
          animation: 'ub-spin 0.7s linear infinite'
        }} />
      </div>
    );
  }

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (!admin && !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
