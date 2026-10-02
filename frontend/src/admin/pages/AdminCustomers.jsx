import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import '../admin.css';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(() => {
    setLoading(true);
    const params = { page, search };
    api.get('/admin/customers', { params })
      .then((res) => {
        setCustomers(res.data.data || []);
        setMeta(res.data.meta);
      })
      .catch(() => {
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">COMMUNAUTÉ DE LA MARQUE</p>
          <h1 className="admin-page-title">CLIENTS</h1>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div style={{ marginBottom: '28px' }}>
        <input
          className="admin-input"
          style={{ maxWidth: '340px' }}
          placeholder="RECHERCHER PAR NOM, EMAIL, TÉL…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* ── Tableau des clients ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-spinner">
            <div className="admin-spinner-ring" />
          </div>
        ) : customers.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUN CLIENT POUR LE MOMENT</p>
            <p className="admin-empty-desc">
              {search ? 'Aucun compte client ne correspond à votre recherche.' : 'Les clients inscrits ou ayant passé commande apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>EMAIL</th>
                <th>TÉLÉPHONE</th>
                <th>COMMANDES</th>
                <th>TOTAL DÉPENSÉ</th>
                <th>DATE D'INSCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                    {c.name}
                  </td>
                  <td style={{ color: '#8C8C8C' }}>
                    {c.email}
                  </td>
                  <td style={{ color: '#8C8C8C' }}>
                    {c.phone || '—'}
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    {c.orders_count || 0}
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    {fmtFCFA(c.total_spent || 0)}
                  </td>
                  <td style={{ color: '#8C8C8C', fontSize: '0.75rem' }}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {meta && meta.last_page > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← PRÉCÉDENT
          </button>
          <span className="admin-pagination-info">
            PAGE {meta.current_page} SUR {meta.last_page}
          </span>
          <button
            type="button"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            SUIVANT →
          </button>
        </div>
      )}
    </div>
  );
}
