import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../admin.css';

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      />

      {/* ── Main Viewport ── */}
      <div className="ub-admin-viewport">
        {/* Top Header */}
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Scrollable Content Area */}
        <main className="ub-admin-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
