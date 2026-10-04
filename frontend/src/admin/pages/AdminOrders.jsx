import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoOrders } from '../data/adminDemoData';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';

const STATUS_OPTS = [
  { value: 'pending',    label: 'EN ATTENTE' },
  { value: 'confirmed',  label: 'CONFIRMÉE' },
  { value: 'processing', label: 'EN PRÉPARATION' },
  { value: 'shipped',    label: 'EXPÉDIÉE' },
  { value: 'delivered',  label: 'LIVRÉE' },
  { value: 'cancelled',  label: 'ANNULÉE' },
];

const PAY_MAP = {
  pending:  { label: 'EN ATTENTE', cls: 'admin-badge-pending' },
  paid:     { label: 'PAYÉE',      cls: 'admin-badge-paid' },
  failed:   { label: 'ÉCHOUÉE',   cls: 'admin-badge-failed' },
  refunded: { label: 'REMBOURSÉE',cls: 'admin-badge-cancelled' },
};

const STATUS_MAP = {
  pending:    { label: 'EN ATTENTE',     cls: 'admin-badge-pending' },
  confirmed:  { label: 'CONFIRMÉE',      cls: 'admin-badge-shipped' },
  processing: { label: 'EN PRÉPARATION', cls: 'admin-badge-shipped' },
  shipped:    { label: 'EXPÉDIÉE',       cls: 'admin-badge-shipped' },
  delivered:  { label: 'LIVRÉE',         cls: 'admin-badge-paid' },
  cancelled:  { label: 'ANNULÉE',        cls: 'admin-badge-cancelled' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(adminDemoOrders);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isDemo, setIsDemo] = useState(true);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    api.get('/admin/orders', { params })
      .then((res) => {
        const items = res.data.data || [];
        if (items.length) {
          setIsDemo(false);
          setOrders(items);
          setMeta(res.data.meta);
          return;
        }
        const query = search.toLowerCase();
        const demoOrders = adminDemoOrders.filter((order) => (!statusFilter || order.order_status === statusFilter) && (!query || [order.order_number, order.customer_name, order.customer_email].some((value) => value.toLowerCase().includes(query))));
        setIsDemo(true);
        setOrders(demoOrders);
        setMeta({ current_page: 1, last_page: 1 });
      })
      .catch(() => {
        const query = search.toLowerCase();
        const demoOrders = adminDemoOrders.filter((order) => (!statusFilter || order.order_status === statusFilter) && (!query || [order.order_number, order.customer_name, order.customer_email].some((value) => value.toLowerCase().includes(query))));
        setIsDemo(true);
        setOrders(demoOrders);
        setMeta({ current_page: 1, last_page: 1 });
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    setUpdateError('');
    try {
      if (isDemo) {
        setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, order_status: newStatus } : order));
        setSelected(null);
        return;
      }
      await api.post(`/admin/orders/${selected.id}/status`, { status: newStatus });
      loadOrders();
      setSelected(null);
    } catch (err) {
      setUpdateError(err?.response?.data?.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">GESTION DES VENTES</p>
          <h1 className="admin-page-title">COMMANDES</h1>
        </div>
      </div>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}

      {/* ── Filtres & Recherche ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ maxWidth: '320px' }}
          placeholder="RECHERCHER PAR N°, CLIENT, EMAIL…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="admin-select"
          style={{ maxWidth: '220px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">TOUS LES STATUTS</option>
          {STATUS_OPTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* ── Tableau des commandes ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-spinner">
            <div className="admin-spinner-ring" />
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUNE COMMANDE POUR LE MOMENT</p>
            <p className="admin-empty-desc">
              {search || statusFilter ? 'Aucun résultat ne correspond à vos filtres.' : 'Les commandes passées sur le site apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° COMMANDE</th>
                <th>CLIENT</th>
                <th>VILLE</th>
                <th>STATUT COMMANDE</th>
                <th>PAIEMENT</th>
                <th>TOTAL</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 800, letterSpacing: '0.08em' }}>
                    {o.order_number}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{o.customer_name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8C8C8C' }}>{o.customer_email}</div>
                  </td>
                  <td style={{ color: '#8C8C8C' }}>
                    {o.shipping_city || '—'}
                  </td>
                  <td>
                    <span className={`admin-badge ${STATUS_MAP[o.order_status]?.cls || 'admin-badge-pending'}`}>
                      {STATUS_MAP[o.order_status]?.label || o.order_status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${PAY_MAP[o.payment_status]?.cls || 'admin-badge-pending'}`}>
                      {PAY_MAP[o.payment_status]?.label || o.payment_status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    {fmtFCFA(o.total)}
                  </td>
                  <td style={{ color: '#8C8C8C', fontSize: '0.75rem' }}>
                    {new Date(o.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      style={{ padding: '8px 16px', fontSize: '0.58rem' }}
                      onClick={() => {
                        setSelected(o);
                        setNewStatus(o.order_status);
                        setUpdateError('');
                      }}
                    >
                      DÉTAIL
                    </button>
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

      {/* ── Modale de détail & Traitement de commande ── */}
      {selected && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">FICHE DE COMMANDE</p>
                <h2 className="admin-modal-title">{selected.order_number}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {updateError && <div className="admin-alert-error">{updateError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: '24px' }}>
              <div className="admin-form-group">
                <label className="admin-label">COORDONNÉES CLIENT</label>
                <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selected.customer_name}</p>
                <p style={{ color: '#8C8C8C', fontSize: '0.8rem', marginTop: 2 }}>{selected.customer_email}</p>
                <p style={{ color: '#8C8C8C', fontSize: '0.8rem', marginTop: 2 }}>{selected.customer_phone || 'Sans téléphone'}</p>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">LIVRAISON</label>
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{selected.shipping_address || '—'}</p>
                <p style={{ color: '#8C8C8C', fontSize: '0.8rem', marginTop: 2 }}>{selected.shipping_city}</p>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">RECAPITULATIF FINANCIER</label>
                <div style={{ fontSize: '0.82rem', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D0CEC9' }}>
                    <span>Sous-total</span>
                    <span>{fmtFCFA(selected.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D0CEC9' }}>
                    <span>Livraison</span>
                    <span>{fmtFCFA(selected.shipping_cost)}</span>
                  </div>
                  {selected.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D0CEC9', fontWeight: 700 }}>
                      <span>Remise code promo</span>
                      <span>−{fmtFCFA(selected.discount_amount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, paddingTop: 4 }}>
                    <span>TOTAL</span>
                    <span>{fmtFCFA(selected.total)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">PAIEMENT & STATUT</label>
                <div style={{ marginTop: 6 }}>
                  <span className={`admin-badge ${PAY_MAP[selected.payment_status]?.cls || 'admin-badge-pending'}`}>
                    PAIEMENT : {PAY_MAP[selected.payment_status]?.label || selected.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Articles de la commande */}
            {selected.items && selected.items.length > 0 && (
              <div className="admin-form-group">
                <label className="admin-label" style={{ marginBottom: 12 }}>ARTICLES DE LA COMMANDE</label>
                <div style={{ border: '1px solid #D0CEC9', backgroundColor: '#FFFFFF' }}>
                  {selected.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: idx < selected.items.length - 1 ? '1px solid #E8E6E1' : 'none',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{it.product_name}</span>
                        {it.variant_info && (
                          <span style={{ color: '#8C8C8C', fontSize: '0.75rem', marginLeft: 8 }}>
                            ({it.variant_info})
                          </span>
                        )}
                        <span style={{ color: '#8C8C8C', marginLeft: 8 }}>× {it.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 800 }}>{fmtFCFA(it.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modifier le statut de traitement */}
            <div className="admin-form-group" style={{ marginTop: 24 }}>
              <label className="admin-label">CHANGER LE STATUT DE LA COMMANDE</label>
              <select
                className="admin-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setSelected(null)}
              >
                FERMER
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'ENREGISTREMENT…' : 'METTRE À JOUR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
