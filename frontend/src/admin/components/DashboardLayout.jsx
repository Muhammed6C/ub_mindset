import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../admin.css';
import { getAdminProducts } from '../services/adminProductsCache';

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Lock body scroll while admin interface is mounted
  useEffect(() => {
    document.body.classList.add('admin-active');
    document.documentElement.classList.add('admin-active');
    void import('../pages/AdminProducts').catch((error) => {
      console.error('Impossible de précharger la page Produits.', error);
    });
    void import('../pages/AdminStock');
    getAdminProducts().catch((error) => {
      console.error('Impossible de précharger le catalogue administrateur.', error);
    });
    return () => {
      document.body.classList.remove('admin-active');
      document.documentElement.classList.remove('admin-active');
    };
  }, []);

  return (
    <div className="ub-admin-app">
      {/* ── Mobile Backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="ub-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Fixed Sidebar ── */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* ── Main Viewport ── */}
      <div
        className={`ub-admin-viewport ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Top Header */}
        <Header
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Scrollable Content Area */}
        <main className="ub-admin-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
