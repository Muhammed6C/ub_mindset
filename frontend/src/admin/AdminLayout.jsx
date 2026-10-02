import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Percent,
  Truck,
  Settings,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import './admin.css';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders',    icon: ShoppingCart,   label: 'Commandes' },
  { to: '/admin/products',  icon: Package,       label: 'Produits' },
  { to: '/admin/customers', icon: Users,         label: 'Clients' },
  { to: '/admin/promotions',icon: Percent,       label: 'Promotions' },
  { to: '/admin/shipping',  icon: Truck,         label: 'Livraison' },
  { to: '/admin/settings',  icon: Settings,      label: 'Réglages' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-wrap">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="admin-sidebar-logo">
          {!collapsed && (
            <div>
              <span className="admin-sidebar-brand">UB MINDSET</span>
              <span className="admin-sidebar-sub">BACK-OFFICE</span>
            </div>
          )}
          <button
            className="admin-sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Agrandir' : 'Réduire'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.5} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {!collapsed && (
            <>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-storefront-link"
              >
                <span>BOUTIQUE EN LIGNE</span>
                <ExternalLink size={12} style={{ marginLeft: 6, display: 'inline' }} />
              </a>
              <p className="admin-user-name">{admin?.name || 'ADMINISTRATEUR'}</p>
            </>
          )}
          <button className="admin-logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
            {!collapsed && <span>DÉCONNEXION</span>}
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
