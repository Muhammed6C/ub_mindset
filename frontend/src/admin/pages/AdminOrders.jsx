import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, ShoppingBag, Plus, MessageCircle, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, Package, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoOrders } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';
import { filterAndSortOrders } from './ordersTableModel';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── Statuts ──────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: 'pending',    label: 'EN ATTENTE',     icon: Clock },
  { value: 'confirmed',  label: 'CONFIRMÉE',      icon: CheckCircle },
  { value: 'processing', label: 'EN PRÉPARATION', icon: Package },
  { value: 'shipped',    label: 'EXPÉDIÉE',       icon: Truck },
  { value: 'delivered',  label: 'LIVRÉE',         icon: CheckCircle },
  { value: 'cancelled',  label: 'ANNULÉE',        icon: XCircle },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTS.map((s) => [s.value, s]));

const PAY_MAP = {
  pending:  { label: 'EN ATTENTE' },
  paid:     { label: 'PAYÉE' },
  failed:   { label: 'ÉCHOUÉE' },
  refunded: { label: 'REMBOURSÉE' },
};

const PAYMENT_OPTS = [
  { value: 'pending', label: 'EN ATTENTE' },
  { value: 'paid', label: 'PAYÉE' },
  { value: 'failed', label: 'ÉCHOUÉE' },
  { value: 'refunded', label: 'REMBOURSÉE' },
];

// ── Badge de statut ──────────────────────────────────────────────────
function StatusBadge({ status, size = 'md' }) {
  const s = STATUS_MAP[status] || { label: status };
  const Icon = s.icon || AlertCircle;
  return (
    <span className={`admin-badge admin-badge--status admin-badge--${STATUS_MAP[status] ? status : 'unknown'}${size === 'sm' ? ' admin-badge--sm' : ''}`}>
      <Icon size={12} aria-hidden="true" />
      {s.label}
    </span>
  );
}

// ── Badge paiement ───────────────────────────────────────────────────
function PayBadge({ status }) {
  const p = PAY_MAP[status] || { label: status };
  return (
    <span className={`admin-badge admin-badge--payment admin-badge--payment-${PAY_MAP[status] ? status : 'unknown'}`}>
      {p.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════
export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState(adminDemoOrders);
  const [isDemo, setIsDemo]       = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filtres
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [sortCol, setSortCol]       = useState('date');
  const [sortDir, setSortDir]       = useState('desc');

  // Pagination
  const [page, setPage]   = useState(1);
  const PER_PAGE          = 10;

  // Sélection multiple
  const [selected, setSelected]     = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkApplying, setBulkApplying] = useState(false);

  // Modale détail
  const [detail, setDetail]         = useState(null);
  const [detailNote, setDetailNote] = useState('');
  const [detailStatus, setDetailStatus] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createProducts, setCreateProducts] = useState([]);
  const [createProductsLoading, setCreateProductsLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    variant_id: '',
    quantity: '1',
    payment_method: 'wave_om',
    notes: '',
  });

  const openCreate = async () => {
    setCreateOpen(true);
    setCreateError('');
    setCreateProducts([]);
    setCreateProductsLoading(true);
    try {
      const response = await api.get('/admin/products', { params: { per_page: 60 } });
      setCreateProducts(response.data?.data || []);
    } catch (error) {
      setCreateError(error?.response?.data?.message || 'Les produits disponibles n’ont pas pu être chargés.');
    } finally {
      setCreateProductsLoading(false);
    }
  };

  const selectedCreateProduct = createProducts.find((product) =>
    product.variants?.some((variant) => String(variant.id) === createForm.variant_id));
  const selectedCreateVariant = selectedCreateProduct
    ? {
      product: selectedCreateProduct,
      variant: selectedCreateProduct.variants.find((variant) => String(variant.id) === createForm.variant_id),
    }
    : null;

  const handleCreateOrder = async () => {
    setCreateError('');
    if (!selectedCreateVariant) {
      setCreateError('Sélectionnez un article avec une variante disponible.');
      return;
    }
    setCreateSaving(true);
    try {
      const customer = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        address: createForm.address.trim(),
        city: createForm.city.trim(),
        payment_method: createForm.payment_method,
      };
      const quantity = Number.parseInt(createForm.quantity, 10);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        setCreateError('La quantité doit être comprise entre 1 et 20.');
        return;
      }
      if (isDemo) {
        const unitPrice = Number(selectedCreateVariant.variant.price ?? selectedCreateVariant.product.price) || 0;
        const total = unitPrice * quantity;
        setAllOrders((orders) => [{
          id: `demo-${Date.now()}`,
          order_number: `DEMO-${Date.now()}`,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          shipping_address: customer.address,
          shipping_city: customer.city,
          order_status: 'pending',
          payment_status: 'pending',
          payment_method: customer.payment_method,
          subtotal: total,
          shipping_cost: 0,
          total,
          created_at: new Date().toISOString(),
          notes: createForm.notes.trim(),
          items: [{
            product_name: selectedCreateVariant.product.name,
            variant_info: [selectedCreateVariant.variant.size || selectedCreateVariant.variant.name, selectedCreateVariant.variant.color].filter(Boolean).join(' · '),
            quantity,
            unit_price: unitPrice,
            total_price: total,
          }],
        }, ...orders]);
      } else {
        await api.post('/orders', {
          customer,
          items: [{ variant_id: selectedCreateVariant.variant.id, quantity }],
          notes: createForm.notes.trim() || undefined,
        });
        loadOrders();
      }
      setCreateOpen(false);
      setCreateForm({
        name: '', email: '', phone: '', address: '', city: '',
        variant_id: '', quantity: '1', payment_method: 'wave_om', notes: '',
      });
      setPage(1);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      setCreateError(errors ? Object.values(errors).flat().join(' · ') : (error?.response?.data?.message || 'La commande n’a pas pu être créée.'));
    } finally {
      setCreateSaving(false);
    }
  };

  // ── Chargement API (arrière-plan) ──────────────────────────────────
  const loadOrders = useCallback(() => {
    api.get('/admin/orders', { params: { per_page: 60 } })
      .then((res) => {
        const items = res.data?.data || [];
        setAllOrders(items);
        setIsDemo(false);
        setLoadError('');
      })
      .catch((err) => {
        setLoadError(err?.response?.data?.message || 'Les commandes n’ont pas pu être chargées.');
      });
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Filtres & tri locaux ───────────────────────────────────────────
  const filtered = useMemo(() => filterAndSortOrders(allOrders, {
    search,
    status: statusFilter,
    payment: paymentFilter,
    dateFrom,
    dateTo,
    sortCol,
    sortDir,
  }), [allOrders, search, statusFilter, paymentFilter, dateFrom, dateTo, sortCol, sortDir]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage     = Math.min(page, totalPages);
  const pageItems    = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ── KPIs ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      allOrders.length,
    pending:    allOrders.filter((o) => o.order_status === 'pending').length,
    processing: allOrders.filter((o) => ['confirmed', 'processing'].includes(o.order_status)).length,
    shipped:    allOrders.filter((o) => o.order_status === 'shipped').length,
    revenue:    allOrders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + (o.total || 0), 0),
  }), [allOrders]);

  // ── Tri par colonne ───────────────────────────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortCol !== col ? null : (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />);
  const hasActiveFilters = Boolean(search || statusFilter || paymentFilter || dateFrom || dateTo);
  const statusCounts = useMemo(() => Object.fromEntries(
    STATUS_OPTS.map(({ value }) => [value, allOrders.filter((order) => order.order_status === value).length]),
  ), [allOrders]);
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const updateStatusFilter = (status) => {
    setStatusFilter((current) => current === status ? '' : status);
    setPage(1);
  };

  // ── Sélection ─────────────────────────────────────────────────────
  const allPageChecked = pageItems.length > 0 && pageItems.every((o) => selected.has(o.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageChecked) pageItems.forEach((o) => next.delete(o.id));
      else pageItems.forEach((o) => next.add(o.id));
      return next;
    });
  };
  const toggleOne = (id) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  // ── Actions groupées ──────────────────────────────────────────────
  const applyBulk = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkApplying(true);
    try {
      if (isDemo) {
        setAllOrders((prev) => prev.map((o) => selected.has(o.id) ? { ...o, order_status: bulkStatus } : o));
      } else {
        await Promise.all([...selected].map((id) => api.post(`/admin/orders/${id}/status`, { status: bulkStatus })));
        loadOrders();
      }
      setSelected(new Set()); setBulkStatus('');
    } catch { /* silencieux */ } finally { setBulkApplying(false); }
  };

  // ── Mise à jour statut (modale) ───────────────────────────────────
  const handleDetailSave = async () => {
    if (!detail) return;
    setDetailSaving(true); setDetailError('');
    try {
      if (isDemo) {
        const ts = new Date().toISOString();
        setAllOrders((prev) => prev.map((o) => o.id !== detail.id ? o : {
          ...o, order_status: detailStatus, notes: detailNote,
          status_history: [...(o.status_history || []), ...(detailStatus !== o.order_status ? [{ status: detailStatus, at: ts }] : [])],
        }));
        setDetail(null);
      } else {
        if (detailStatus !== detail.order_status) await api.post(`/admin/orders/${detail.id}/status`, { status: detailStatus });
        await api.put(`/admin/orders/${detail.id}`, { notes: detailNote });
        loadOrders(); setDetail(null);
      }
    } catch (err) {
      setDetailError(err?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally { setDetailSaving(false); }
  };

  const openDetail = (o) => { setDetail(o); setDetailStatus(o.order_status); setDetailNote(o.notes || ''); setDetailError(''); };
  const whatsapp = (phone) => { const n = (phone || '').replace(/\D/g, ''); window.open(`https://wa.me/${n}`, '_blank'); };

  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="admin-page">
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / VENTES</p>
          <h1>COMMANDES</h1>
          <span>Suivi en temps réel de chaque commande — du panier à la livraison.</span>
        </div>
        <div className="ub-admin-page-lead__actions">
          <button type="button" className="ub-orders-export-btn" onClick={openCreate}>
            <Plus size={14} /> AJOUTER UNE COMMANDE
          </button>
        </div>
      </header>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}
      {loadError && <div className="admin-alert-error" role="alert">{loadError}</div>}

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <section className="admin-products-stats" aria-label="Synthèse des commandes">
        <ProductStatCard icon="package" value={stats.total}      label="TOTAL COMMANDES" trend="+24%" period="ce mois" index={0} />
        <ProductStatCard icon="x"       value={stats.pending}    label="EN ATTENTE"      trend="+5%"  period="aujourd'hui" index={1} />
        <ProductStatCard icon="package" value={stats.processing} label="EN PRÉPARATION"  trend="—"    period="en cours" index={2} />
        <ProductStatCard icon="check"   value={stats.shipped}    label="EXPÉDIÉES"       trend="+18%" period="cette semaine" index={3} />
      </section>

      {/* ── Filtres ─────────────────────────────────────────────────── */}
      <section className="ub-orders-toolbar ub-orders-filter-panel" aria-label="Filtres des commandes">
        <div className="ub-orders-search">
          <Search size={15} aria-hidden="true" />
          <input
            className="admin-input ub-admin-filter-input"
            aria-label="Rechercher une commande"
            placeholder="N° commande, client, téléphone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-select ub-admin-filter-select" aria-label="Filtrer par paiement" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
          <option value="">TOUS LES PAIEMENTS</option>
          {PAYMENT_OPTS.map((payment) => <option key={payment.value} value={payment.value}>{payment.label}</option>)}
        </select>
        <div className="ub-orders-date-range" role="group" aria-label="Période des commandes">
          <label>
            <span>DU</span>
            <input type="date" className="admin-input" value={dateFrom} max={dateTo || undefined} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          </label>
          <span className="ub-orders-date-separator" aria-hidden="true">→</span>
          <label>
            <span>AU</span>
            <input type="date" className="admin-input" value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </label>
        </div>
        {hasActiveFilters && (
          <button type="button" className="ub-orders-reset-btn" onClick={resetFilters}>
            EFFACER LES FILTRES
          </button>
        )}
      </section>
      <div className="ub-orders-status-filters" role="group" aria-label="Filtrer par statut de commande">
        <button type="button" className={`admin-products-pill ${statusFilter === '' ? 'active' : ''}`} aria-pressed={!statusFilter} onClick={() => updateStatusFilter('')}>
          TOUTES <span>{allOrders.length}</span>
        </button>
        {STATUS_OPTS.map((status) => (
          <button
            key={status.value}
            type="button"
            className={`admin-products-pill ${statusFilter === status.value ? 'active' : ''}`}
            aria-pressed={statusFilter === status.value}
            onClick={() => updateStatusFilter(status.value)}
          >
            {status.label} <span>{statusCounts[status.value]}</span>
          </button>
        ))}
      </div>
      <div className="ub-orders-results-summary" aria-live="polite">
        <span>
          {hasActiveFilters
            ? `${filtered.length} COMMANDE${filtered.length === 1 ? '' : 'S'} CORRESPONDANTE${filtered.length === 1 ? '' : 'S'}`
            : `${filtered.length} COMMANDE${filtered.length === 1 ? '' : 'S'} AU TOTAL`}
        </span>
        {hasActiveFilters && <button type="button" onClick={resetFilters}>RÉINITIALISER</button>}
      </div>

      {/* ── Actions groupées ────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="ub-orders-bulk-bar" aria-live="polite">
          <span className="ub-orders-bulk-count">{selected.size} SÉLECTIONNÉE{selected.size > 1 ? 'S' : ''}</span>
          <select className="admin-select" style={{ maxWidth: 200 }} value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="">Changer le statut…</option>
            {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="button" className="admin-btn admin-btn-primary" onClick={applyBulk} disabled={!bulkStatus || bulkApplying} style={{ fontSize: '0.62rem', padding: '0 16px' }}>
            {bulkApplying ? 'APPLICATION…' : 'APPLIQUER'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setSelected(new Set())} style={{ fontSize: '0.62rem', padding: '0 14px' }}>
            ANNULER
          </button>
        </div>
      )}

      {/* ── Tableau ─────────────────────────────────────────────────── */}
      <div className="admin-table-wrap ub-orders-table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <ShoppingBag size={36} strokeWidth={1.4} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <p className="admin-empty-label">AUCUNE COMMANDE</p>
            <p className="admin-empty-desc">
              {hasActiveFilters
                ? 'Aucun résultat ne correspond à vos filtres.'
                : 'Les commandes passées sur le site apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <table className="admin-table ub-orders-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={allPageChecked} onChange={toggleAll} className="ub-orders-check" aria-label="Sélectionner toutes les commandes de cette page" />
                </th>
                <th>N° COMMANDE</th>
                <th>CLIENT</th>
                <th>ARTICLES</th>
                <th aria-sort={sortCol === 'date' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-orders-sort" onClick={() => toggleSort('date')}>
                    DATE <SortIcon col="date" />
                  </button>
                </th>
                <th>STATUT</th>
                <th>PAIEMENT</th>
                <th aria-sort={sortCol === 'total' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-orders-sort" onClick={() => toggleSort('total')}>
                    TOTAL <SortIcon col="total" />
                  </button>
                </th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((o) => (
                <tr key={o.id} className={selected.has(o.id) ? 'ub-orders-row--selected' : ''}>
                  <td>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="ub-orders-check" aria-label={`Sélectionner la commande ${o.order_number}`} />
                  </td>
                  <td>
                    <span className="ub-orders-num">{o.order_number}</span>
                  </td>
                  <td>
                    <div className="ub-orders-customer-name">{o.customer_name}</div>
                    <div className="ub-orders-customer-sub">{o.customer_phone || o.customer_email}</div>
                  </td>
                  <td>
                    <div className="ub-orders-items-preview">
                      {(o.items || []).slice(0, 2).map((it, i) => (
                        <span key={i} className="ub-orders-item-chip">
                          {it.product_name}
                          {it.variant_info && <span style={{ opacity: 0.65 }}> · {it.variant_info}</span>}
                          {it.quantity > 1 && <span style={{ fontWeight: 900 }}> ×{it.quantity}</span>}
                        </span>
                      ))}
                      {(o.items || []).length > 2 && <span className="ub-orders-item-more">+{o.items.length - 2}</span>}
                    </div>
                  </td>
                  <td className="ub-orders-date">{fmtDate(o.created_at)}</td>
                  <td><StatusBadge status={o.order_status} size="sm" /></td>
                  <td><PayBadge status={o.payment_status} /></td>
                  <td className="ub-orders-total">{fmtFCFA(o.total)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="ub-orders-detail-btn" onClick={() => openDetail(o)} aria-label={`Voir la commande ${o.order_number}`}>
                      DÉTAIL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="ub-orders-pagination">
          <span className="ub-orders-pagination-info">
            {filtered.length} COMMANDE{filtered.length > 1 ? 'S' : ''} · PAGE {safePage} / {totalPages}
          </span>
          <div className="ub-orders-pagination-controls">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>‹ PRÉC.</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className={n === safePage ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>SUIV. ›</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE DE DÉTAIL COMMANDE
      ══════════════════════════════════════════════════════════════ */}
      {detail && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="admin-modal ub-order-detail-modal admin-modal--category-style">
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">FICHE DE COMMANDE</p>
                <h2 className="admin-modal-title">{detail.order_number}</h2>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {detail.customer_phone && (
                  <button type="button" className="ub-whatsapp-btn" onClick={() => whatsapp(detail.customer_phone)}>
                    <MessageCircle size={14} /> WHATSAPP
                  </button>
                )}

                <button type="button" className="admin-modal-close" onClick={() => setDetail(null)} aria-label="Fermer">✕</button>
              </div>
            </div>

            {detailError && <div className="admin-alert-error">{detailError}</div>}

            {/* Deux colonnes : client + livraison */}
            <div className="ub-order-detail-grid admin-order-detail__section">
              <div className="ub-order-detail-block">
                <p className="admin-label">CLIENT</p>
                <p className="ub-order-detail-name">{detail.customer_name}</p>
                <p className="ub-order-detail-sub">{detail.customer_email}</p>
                {detail.customer_phone && <p className="ub-order-detail-sub">{detail.customer_phone}</p>}
              </div>
              <div className="ub-order-detail-block">
                <p className="admin-label">LIVRAISON</p>
                <p className="ub-order-detail-name" style={{ fontSize: '0.88rem' }}>{detail.shipping_address || '—'}</p>
                <p className="ub-order-detail-sub">{detail.shipping_city}</p>
              </div>
              <div className="ub-order-detail-block">
                <p className="admin-label">DATE</p>
                <p className="ub-order-detail-name" style={{ fontSize: '0.88rem' }}>{fmtDateTime(detail.created_at)}</p>
                <PayBadge status={detail.payment_status} />
              </div>
              <div className="ub-order-detail-block">
                <p className="admin-label">STATUT ACTUEL</p>
                <StatusBadge status={detail.order_status} />
              </div>
            </div>

            {/* Articles */}
            {detail.items?.length > 0 && (
              <div className="admin-order-detail__section">
                <p className="admin-label" style={{ marginBottom: 10 }}>ARTICLES COMMANDÉS</p>
                <div className="ub-order-items-table">
                  {detail.items.map((it, idx) => (
                    <div key={idx} className="ub-order-item-row">
                      <div className="ub-order-item-info">
                        <span className="ub-order-item-name">{it.product_name}</span>
                        {it.variant_info && <span className="ub-order-item-variant">{it.variant_info}</span>}
                        <span className="ub-order-item-qty">× {it.quantity}</span>
                      </div>
                      <span className="ub-order-item-price">{fmtFCFA(it.total_price)}</span>
                    </div>
                  ))}
                  <div className="ub-order-items-sep" />
                  <div className="ub-order-item-row" style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    <span>Sous-total</span><span>{fmtFCFA(detail.subtotal)}</span>
                  </div>
                  <div className="ub-order-item-row" style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    <span>Livraison</span><span>{fmtFCFA(detail.shipping_cost)}</span>
                  </div>
                  {detail.discount_amount > 0 && (
                    <div className="ub-order-item-row" style={{ fontSize: '0.78rem', color: '#059669' }}>
                      <span>Remise</span><span>−{fmtFCFA(detail.discount_amount)}</span>
                    </div>
                  )}
                  <div className="ub-order-item-row ub-order-item-total">
                    <span>TOTAL</span><span>{fmtFCFA(detail.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Historique des statuts */}
            {detail.status_history?.length > 0 && (
              <div className="admin-order-detail__section">
                <p className="admin-label" style={{ marginBottom: 10 }}>HISTORIQUE DU STATUT</p>
                <div className="ub-order-timeline">
                  {detail.status_history.map((h, i) => (
                    <div key={i} className="ub-order-timeline-item">
                      <div className={`ub-order-timeline-dot ${i === detail.status_history.length - 1 ? 'is-current' : ''}`} />
                      <div>
                        <StatusBadge status={h.status} size="sm" />
                        <span className="ub-order-timeline-date">{fmtDateTime(h.at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changer le statut */}
            <div className="admin-form-group">
              <label className="admin-label">MODIFIER LE STATUT</label>
              <select className="admin-select" value={detailStatus} onChange={(e) => setDetailStatus(e.target.value)}>
                {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Notes internes */}
            <div className="admin-form-group">
              <label className="admin-label">NOTES INTERNES</label>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Remarques internes visibles uniquement par l'équipe…"
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                style={{ resize: 'vertical', minHeight: 72 }}
              />
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDetail(null)}>FERMER</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleDetailSave} disabled={detailSaving}>
                {detailSaving ? 'ENREGISTREMENT…' : 'ENREGISTRER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="admin-modal-overlay" onClick={(event) => event.target === event.currentTarget && !createSaving && setCreateOpen(false)}>
          <div className="admin-modal admin-product-modal admin-create-order-modal admin-modal--category-style" role="dialog" aria-modal="true" aria-labelledby="create-order-title">
            <div className="admin-modal-header admin-product-modal__header">
              <div className="admin-product-modal__heading">
                <span className="admin-product-modal__icon" aria-hidden="true"><ShoppingBag size={19} /></span>
                <div>
                  <p className="admin-modal-eyebrow">NOUVELLE COMMANDE</p>
                  <h2 id="create-order-title" className="admin-modal-title">ENREGISTRER UNE VENTE</h2>
                  <p className="admin-product-modal__subtitle">Saisissez les coordonnées du client et l’article commandé.</p>
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => !createSaving && setCreateOpen(false)} aria-label="Fermer">✕</button>
            </div>
            {createError && <div className="admin-alert-error" role="alert">{createError}</div>}
            <div className="admin-product-form">
              <section className="admin-product-form__section">
                <div className="admin-product-form__section-heading">
                  <span>01</span>
                  <div><h3>Coordonnées client</h3><p>Informations nécessaires au suivi et à la livraison.</p></div>
                </div>
                <div className="admin-product-form__fields">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="order-customer-name">NOM COMPLET *</label>
                    <input id="order-customer-name" className="admin-input" value={createForm.name} onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))} autoComplete="name" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="order-customer-phone">TÉLÉPHONE *</label>
                    <input id="order-customer-phone" className="admin-input" type="tel" value={createForm.phone} onChange={(event) => setCreateForm((form) => ({ ...form, phone: event.target.value }))} autoComplete="tel" />
                  </div>
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="order-customer-email">EMAIL *</label>
                    <input id="order-customer-email" className="admin-input" type="email" value={createForm.email} onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))} autoComplete="email" />
                  </div>
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="order-customer-address">ADRESSE DE LIVRAISON *</label>
                    <input id="order-customer-address" className="admin-input" value={createForm.address} onChange={(event) => setCreateForm((form) => ({ ...form, address: event.target.value }))} autoComplete="street-address" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="order-customer-city">VILLE *</label>
                    <input id="order-customer-city" className="admin-input" value={createForm.city} onChange={(event) => setCreateForm((form) => ({ ...form, city: event.target.value }))} autoComplete="address-level2" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="order-payment-method">MODE DE PAIEMENT</label>
                    <select id="order-payment-method" className="admin-select" value={createForm.payment_method} onChange={(event) => setCreateForm((form) => ({ ...form, payment_method: event.target.value }))}>
                      <option value="wave_om">WAVE / ORANGE MONEY</option>
                      <option value="card">CARTE BANCAIRE</option>
                    </select>
                  </div>
                </div>
              </section>
              <section className="admin-product-form__section">
                <div className="admin-product-form__section-heading">
                  <span>02</span>
                  <div><h3>Article commandé</h3><p>Le tarif et le stock seront vérifiés par le serveur.</p></div>
                </div>
                <div className="admin-product-form__fields">
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="order-variant">PRODUIT & VARIANTE *</label>
                    <select id="order-variant" className="admin-select" value={createForm.variant_id} onChange={(event) => setCreateForm((form) => ({ ...form, variant_id: event.target.value }))} disabled={createProductsLoading}>
                      <option value="">{createProductsLoading ? 'CHARGEMENT DES PRODUITS…' : 'SÉLECTIONNER UN ARTICLE'}</option>
                      {createProducts.flatMap((product) => (product.variants || []).map((variant) => (
                        <option key={variant.id} value={variant.id} disabled={!product.is_active || variant.stock < 1}>
                          {product.name} · {[variant.size, variant.color, variant.sku].filter(Boolean).join(' / ') || `Variante ${variant.id}`} · {fmtFCFA(variant.price)} · STOCK {variant.stock}
                        </option>
                      )))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="order-quantity">QUANTITÉ *</label>
                    <input id="order-quantity" className="admin-input" type="number" min="1" max="20" value={createForm.quantity} onChange={(event) => setCreateForm((form) => ({ ...form, quantity: event.target.value }))} />
                  </div>
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="order-notes">NOTE (OPTIONNELLE)</label>
                    <textarea id="order-notes" className="admin-input" rows={2} maxLength={1000} value={createForm.notes} onChange={(event) => setCreateForm((form) => ({ ...form, notes: event.target.value }))} />
                  </div>
                </div>
              </section>
            </div>
            <div className="admin-modal-footer admin-product-modal__footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setCreateOpen(false)} disabled={createSaving}>ANNULER</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleCreateOrder} disabled={createSaving || createProductsLoading || !selectedCreateVariant}>
                {createSaving ? 'ENREGISTREMENT…' : 'ENREGISTRER LA COMMANDE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
