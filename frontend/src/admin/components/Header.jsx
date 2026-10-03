import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Header({ onMenuClick }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/admin/login');
  };

  return (
    <header className="ub-header">
      {/* ── Mobile Hamburger ── */}
      <button
        type="button"
        className="ub-header-menu-btn"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Search Bar ── */}
      <div className="ub-header-search">
        <svg className="ub-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="ub-search-input"
          placeholder="Rechercher un produit, une commande, un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="ub-search-shortcut">⌘ K</kbd>
      </div>

      {/* ── Right Actions ── */}
      <div className="ub-header-right">
        {/* Notifications */}
        <div className="ub-header-notif-wrapper">
          <button
            type="button"
            className="ub-header-icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="ub-notif-dot" />
          </button>

          {notificationsOpen && (
            <div className="ub-notif-dropdown">
              <div className="ub-notif-header">
                <span>NOTIFICATIONS</span>
                <span className="ub-notif-badge">3 NOUVELLES</span>
              </div>
              <div className="ub-notif-list">
                <div className="ub-notif-item unread">
                  <p className="ub-notif-title">Nouvelle commande #UB2025083174</p>
                  <p className="ub-notif-time">Il y a 10 minutes · 42 500 FCFA</p>
                </div>
                <div className="ub-notif-item unread">
                  <p className="ub-notif-title">Stock faible : T-shirt Oversize</p>
                  <p className="ub-notif-time">Il y a 32 minutes · 12 unités restantes</p>
                </div>
                <div className="ub-notif-item">
                  <p className="ub-notif-title">Nouveau client inscrit : Seydina</p>
                  <p className="ub-notif-time">Il y a 2 heures</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="ub-header-user-wrapper">
          <button
            type="button"
            className="ub-header-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="ub-user-avatar">
              SC
            </div>
            <div className="ub-user-info">
              <span className="ub-user-name">{admin?.name || 'Seydina Cissé'}</span>
              <span className="ub-user-role">Administrateur</span>
            </div>
            <svg
              className={`ub-user-chevron ${dropdownOpen ? 'open' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="ub-user-dropdown">
              <div className="ub-user-dropdown-header">
                <p className="ub-dropdown-user">{admin?.name || 'Seydina Cissé'}</p>
                <p className="ub-dropdown-email">{admin?.email || 'admin@ubmindset.com'}</p>
              </div>
              <a href="/" target="_blank" rel="noreferrer" className="ub-dropdown-item">
                Voir la boutique en ligne ↗
              </a>
              <button
                type="button"
                className="ub-dropdown-item ub-dropdown-logout"
                onClick={handleLogout}
              >
                Déconnexion ⎋
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
