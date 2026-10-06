import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Users, MessageCircle, Star, Clock, TrendingUp, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoCustomers, adminDemoOrders } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';

const fmtFCFA   = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Segmentation client automatique ─────────────────────────────────
function getSegment(customer) {
  const orders     = customer.orders_count || 0;
  const lastDate   = customer.last_order_at;
  const daysSince  = lastDate ? Math.floor((Date.now() - new Date(lastDate)) / 86400000) : Infinity;

  if (orders === 0) return { label: 'NOUVEAU', tone: 'new' };
  if (daysSince >= 60) return { label: 'INACTIF', tone: 'inactive' };
  if (orders >= 3) return { label: 'RÉGULIER', tone: 'regular' };
  return { label: 'ACTIF', tone: 'active' };
}

function SegmentBadge({ customer }) {
  const s = getSegment(customer);
  return (
    <span className={`admin-badge admin-badge--segment admin-badge--${s.tone}`}>
      {s.label}
    </span>
  );
}

// ── Statuts commandes (mini badge) ───────────────────────────────────
const STATUS_MAP = {
  pending:    { label: 'EN ATTENTE' },
  confirmed:  { label: 'CONFIRMÉE' },
  processing: { label: 'EN PRÉPARATION' },
  shipped:    { label: 'EXPÉDIÉE' },
  delivered:  { label: 'LIVRÉE' },
  cancelled:  { label: 'ANNULÉE' },
};

// ════════════════════════════════════════════════════════════════════
export default function AdminCustomers() {
  const [allCustomers, setAllCustomers] = useState(adminDemoCustomers);
  const [isDemo, setIsDemo]             = useState(true);

  // Filtres & tri
  const [search, setSearch]     = useState('');
  const [sortCol, setSortCol]   = useState('total_spent');
  const [sortDir, setSortDir]   = useState('desc');
  const [segFilter, setSegFilter] = useState('');

  // Pagination
  const [page, setPage]  = useState(1);
  const PER_PAGE         = 10;

  // Modale
  const [detail, setDetail]       = useState(null);
  const [detailNote, setDetailNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // ── Chargement API ────────────────────────────────────────────────
  const loadCustomers = useCallback(() => {
    api.get('/admin/customers', { params: { per_page: 100 } })
      .then((res) => {
        const items = res.data?.data || [];
        if (items.length) { setAllCustomers(items); setIsDemo(false); }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // ── Ordres associés au client sélectionné (démo) ─────────────────
  const customerOrders = useMemo(() => {
    if (!detail) return [];
    if (isDemo) return adminDemoOrders.filter((o) => o.customer_id === detail.id);
    return [];
  }, [detail, isDemo]);

  // ── Filtres & tri ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allCustomers.filter((c) => {
      if (q && !([c.name, c.email, c.phone].some((v) => (v || '').toLowerCase().includes(q)))) return false;
      if (segFilter) {
        const seg = getSegment(c);
        if (seg.label !== segFilter) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'orders_count') return dir * ((a.orders_count || 0) - (b.orders_count || 0));
      if (sortCol === 'last_order')   return dir * (new Date(a.last_order_at || 0) - new Date(b.last_order_at || 0));
      if (sortCol === 'created')      return dir * (new Date(a.created_at || 0) - new Date(b.created_at || 0));
      return dir * ((a.total_spent || 0) - (b.total_spent || 0));
    });
    return list;
  }, [allCustomers, search, sortCol, sortDir, segFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ── KPIs ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allCustomers.length,
    regulars: allCustomers.filter((c) => c.orders_count >= 3).length,
    inactive: allCustomers.filter((c) => {
      const d = c.last_order_at ? Math.floor((Date.now() - new Date(c.last_order_at)) / 86400000) : Infinity;
      return d >= 60;
    }).length,
    revenue:  allCustomers.reduce((s, c) => s + (c.total_spent || 0), 0),
  }), [allCustomers]);

  // ── Tri par colonne ───────────────────────────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortCol !== col ? null : (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />);

  // ── WhatsApp ──────────────────────────────────────────────────────
  const whatsapp = (phone) => { const n = (phone || '').replace(/\D/g, ''); window.open(`https://wa.me/${n}`, '_blank'); };

  // ── Sauvegarde note (modale) ──────────────────────────────────────
  const saveNote = async () => {
    if (!detail) return;
    setNoteSaving(true);
    try {
      if (isDemo) {
        setAllCustomers((prev) => prev.map((c) => c.id === detail.id ? { ...c, notes: detailNote } : c));
      } else {
        await api.put(`/admin/customers/${detail.id}`, { notes: detailNote });
        loadCustomers();
      }
      setDetail(null);
    } catch { /* silencieux */ } finally { setNoteSaving(false); }
  };

  const openDetail = (c) => { setDetail(c); setDetailNote(c.notes || ''); };

  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="admin-page admin-page--customers">
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / COMMUNAUTÉ</p>
          <h1>CLIENTS</h1>
          <span>Vue sur chaque membre de la communauté — achats, fidélité et activité.</span>
        </div>
      </header>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <section className="admin-products-stats" aria-label="Synthèse des clients">
        <ProductStatCard icon="package" value={stats.total}    label="CLIENTS ENREGISTRÉS" trend="+12%" period="ce mois"    index={0} />
        <ProductStatCard icon="star"    value={stats.regulars} label="CLIENTS RÉGULIERS"    trend="+8%"  period="ce mois"    index={1} />
        <ProductStatCard icon="x"       value={stats.inactive} label="CLIENTS INACTIFS"     trend="—"    period="60+ jours"  index={2} />
        <ProductStatCard icon="check"   value={fmtFCFA(stats.revenue)} label="TOTAL DÉPENSÉ"  trend="+22%" period="ce mois"    index={3} />
      </section>

      {/* ── Barre filtres ────────────────────────────────────────────── */}
      <section className="ub-orders-toolbar">
        <div className="ub-orders-search">
          <Search size={15} />
          <input
            className="admin-input ub-admin-filter-input"
            placeholder="Nom, email, téléphone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-select ub-admin-filter-select" style={{ maxWidth: 180 }} value={segFilter} onChange={(e) => { setSegFilter(e.target.value); setPage(1); }}>
          <option value="">TOUS LES SEGMENTS</option>
          <option value="NOUVEAU">NOUVEAUX</option>
          <option value="ACTIF">ACTIFS</option>
          <option value="RÉGULIER">RÉGULIERS (3+ CMD)</option>
          <option value="INACTIF">INACTIFS (60+ JOURS)</option>
        </select>
        {(search || segFilter) && (
          <button type="button" className="ub-orders-reset-btn" onClick={() => { setSearch(''); setSegFilter(''); setPage(1); }}>
            RÉINITIALISER
          </button>
        )}
      </section>

      {/* ── Tableau ─────────────────────────────────────────────────── */}
      <div className="admin-table-wrap ub-customers-table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <Users size={36} strokeWidth={1.4} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <p className="admin-empty-label">AUCUN CLIENT</p>
            <p className="admin-empty-desc">
              {search || segFilter ? 'Aucun client ne correspond à ces critères.' : 'Les clients enregistrés apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <table className="admin-table ub-customers-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>TÉLÉPHONE</th>
                <th>SEGMENT</th>
                <th aria-sort={sortCol === 'orders_count' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-customers-sort" onClick={() => toggleSort('orders_count')}>
                    COMMANDES <SortIcon col="orders_count" />
                  </button>
                </th>
                <th aria-sort={sortCol === 'total_spent' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-customers-sort" onClick={() => toggleSort('total_spent')}>
                    TOTAL DÉPENSÉ <SortIcon col="total_spent" />
                  </button>
                </th>
                <th aria-sort={sortCol === 'created' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-customers-sort" onClick={() => toggleSort('created')}>
                    INSCRIPTION <SortIcon col="created" />
                  </button>
                </th>
                <th aria-sort={sortCol === 'last_order' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="ub-customers-sort" onClick={() => toggleSort('last_order')}>
                    DERNIÈRE ACTIVITÉ <SortIcon col="last_order" />
                  </button>
                </th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="ub-customers-avatar-cell">
                      <div className="ub-customers-avatar">
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="ub-orders-customer-name">{c.name}</div>
                        <div className="ub-orders-customer-sub">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ub-orders-customer-sub">{c.phone || '—'}</td>
                  <td><SegmentBadge customer={c} /></td>
                  <td className="ub-customers-orders-count">{c.orders_count || 0}</td>
                  <td className="ub-customers-spent">{fmtFCFA(c.total_spent || 0)}</td>
                  <td className="ub-customers-date">{fmtDate(c.created_at || c.first_order_at)}</td>
                  <td className="ub-customers-date">{fmtDate(c.last_order_at)}</td>
                  <td className="ub-customers-actions">
                    <div>
                      {c.phone && (
                        <button type="button" className="ub-whatsapp-btn ub-whatsapp-btn--sm" onClick={() => whatsapp(c.phone)} title="WhatsApp" aria-label={`Contacter ${c.name} sur WhatsApp`}>
                          <MessageCircle size={13} />
                        </button>
                      )}
                      <button type="button" className="ub-orders-detail-btn" onClick={() => openDetail(c)} aria-label={`Ouvrir la fiche de ${c.name}`}>
                        FICHE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="ub-orders-pagination ub-customers-pagination">
          <span className="ub-orders-pagination-info">
            {filtered.length} CLIENT{filtered.length > 1 ? 'S' : ''} · PAGE {safePage} / {totalPages}
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
          MODALE FICHE CLIENT
      ══════════════════════════════════════════════════════════════ */}
      {detail && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="admin-modal ub-customer-detail-modal">
            {/* Header */}
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="ub-customers-avatar ub-customers-avatar--lg">
                  {(detail.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="admin-modal-eyebrow">FICHE CLIENT</p>
                  <h2 className="admin-modal-title">{detail.name}</h2>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {detail.phone && (
                  <button type="button" className="ub-whatsapp-btn" onClick={() => whatsapp(detail.phone)}>
                    <MessageCircle size={14} /> WHATSAPP
                  </button>
                )}
                <button type="button" className="admin-modal-close" onClick={() => setDetail(null)} aria-label="Fermer">✕</button>
              </div>
            </div>

            {/* Mini KPIs client */}
            <div className="ub-customer-kpis">
              <div className="ub-customer-kpi">
                <ShoppingBag size={16} />
                <div>
                  <span className="ub-customer-kpi-value">{detail.orders_count || 0}</span>
                  <span className="ub-customer-kpi-label">COMMANDES</span>
                </div>
              </div>
              <div className="ub-customer-kpi">
                <TrendingUp size={16} />
                <div>
                  <span className="ub-customer-kpi-value">{fmtFCFA(detail.total_spent || 0)}</span>
                  <span className="ub-customer-kpi-label">TOTAL DÉPENSÉ</span>
                </div>
              </div>
              <div className="ub-customer-kpi">
                <Star size={16} />
                <div>
                  <span className="ub-customer-kpi-value"><SegmentBadge customer={detail} /></span>
                  <span className="ub-customer-kpi-label">SEGMENT</span>
                </div>
              </div>
              <div className="ub-customer-kpi">
                <Clock size={16} />
                <div>
                  <span className="ub-customer-kpi-value" style={{ fontSize: '0.85rem' }}>{fmtDate(detail.last_order_at)}</span>
                  <span className="ub-customer-kpi-label">DERNIÈRE COMMANDE</span>
                </div>
              </div>
            </div>

            {/* Infos contact */}
            <div className="ub-order-detail-grid" style={{ marginBottom: 20 }}>
              <div className="ub-order-detail-block">
                <p className="admin-label">EMAIL</p>
                <p className="ub-order-detail-sub" style={{ fontSize: '0.88rem' }}>{detail.email}</p>
              </div>
              <div className="ub-order-detail-block">
                <p className="admin-label">TÉLÉPHONE</p>
                <p className="ub-order-detail-sub" style={{ fontSize: '0.88rem' }}>{detail.phone || '—'}</p>
              </div>
              <div className="ub-order-detail-block">
                <p className="admin-label">CLIENT DEPUIS</p>
                <p className="ub-order-detail-sub" style={{ fontSize: '0.88rem' }}>{fmtDate(detail.created_at)}</p>
              </div>
              {detail.sizes_ordered?.length > 0 && (
                <div className="ub-order-detail-block">
                  <p className="admin-label">TAILLES COMMANDÉES</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {[...new Set(detail.sizes_ordered)].map((sz) => (
                      <span key={sz} className="ub-size-chip">{sz}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Historique des commandes */}
            {customerOrders.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p className="admin-label" style={{ marginBottom: 10 }}>HISTORIQUE DES COMMANDES</p>
                <div className="ub-customer-orders-list">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="ub-customer-order-row">
                      <div>
                        <span className="ub-orders-num" style={{ fontSize: '0.75rem' }}>{o.order_number}</span>
                        <span className="ub-orders-date" style={{ marginLeft: 10 }}>{fmtDate(o.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`admin-badge admin-badge--status admin-badge--${STATUS_MAP[o.order_status] ? o.order_status : 'unknown'} admin-badge--sm`}>
                          {STATUS_MAP[o.order_status]?.label || o.order_status}
                        </span>
                        <span className="ub-orders-total" style={{ fontSize: '0.85rem' }}>{fmtFCFA(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes internes */}
            <div className="admin-form-group">
              <label className="admin-label">NOTES INTERNES</label>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Préférences, échanges effectués, remarques de l'équipe…"
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                style={{ resize: 'vertical', minHeight: 72 }}
              />
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDetail(null)}>FERMER</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={saveNote} disabled={noteSaving}>
                {noteSaving ? 'ENREGISTREMENT…' : 'SAUVEGARDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
