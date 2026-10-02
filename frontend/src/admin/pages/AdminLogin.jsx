import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import '../admin.css';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-box">

        {/* Brand */}
        <div className="admin-login-brand">
          <p className="admin-login-eyebrow">Espace Administration</p>
          <h1 className="admin-login-title">UB Mindset</h1>
          <div className="admin-login-sep" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <div className="admin-alert-error">{error}</div>}

          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              className="admin-input"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 32 }}>
            <label className="admin-label">Mot de passe</label>
            <input
              className="admin-input"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px 22px' }}
          >
            {loading ? 'Connexion…' : 'Accéder au back-office'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 40, fontSize: '0.58rem', color: '#B0AEA9', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          UB Mindset © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
