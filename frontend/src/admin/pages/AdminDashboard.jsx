import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
  Target,
  ArrowUpRight,
  Package,
  Ruler,
} from 'lucide-react';
import api from '../../services/api';
import '../admin.css';

const fmtFCFA = (val) => new Intl.NumberFormat('fr-FR').format(Math.round(val || 0)) + ' FCFA';

const PERIODS = [
  { key: 'day',   label: 'JOUR' },
  { key: 'week',  label: 'SEMAINE' },
  { key: 'month', label: 'MOIS' },
];

const CATEGORIES = ['TOUTES', 'UB-FOOT', 'UB-BASKET', 'UB-LIFT'];

function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div style={{
      backgroundColor: '#0A0A0A',
      color: '#F2F1EF',
      padding: '12px 16px',
      border: '1px solid #1E1E1E',
      fontFamily: 'Archivo, sans-serif'
    }}>
      <p style={{
        fontSize: '0.58rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#8C8C8C',
        marginBottom: '6px'
      }}>
        {label}
      </p>
      <p style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2px' }}>
        {fmtFCFA(data?.revenue || 0)}
      </p>
      <p style={{ fontSize: '0.68rem', color: '#8C8C8C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {data?.orders || 0} COMMANDE{(data?.orders || 0) > 1 ? 'S' : ''}
      </p>
    </div>
  );
}

const KPI_CARDS = [
  {
    key: 'revenue',
    icon: Wallet,
    label: "CHIFFRE D'AFFAIRES",
    color: '#0A0A0A',
    bg: '#F0EEE9',
  },
  {
    key: 'orders',
    icon: ShoppingCart,
    label: 'COMMANDES',
    color: '#0A0A0A',
    bg: '#F0EEE9',
  },
  {
    key: 'avg_basket',
    icon: Target,
    label: 'PANIER MOYEN',
    color: '#0A0A0A',
    bg: '#F0EEE9',
  },
  {
    key: 'conv_rate',
    icon: TrendingUp,
    label: 'TAUX DE CONVERSION',
    color: '#0A0A0A',
    bg: '#F0EEE9',
  },
];

const MOCK_DATA = {
  kpis: {
    revenue: 2450000,
    prev_revenue: 1890000,
    orders: 187,
    avg_basket: 13101,
    conv_rate: 3.2,
  },
  sales_chart: [
    { label: '01', revenue: 45000, orders: 3 },
    { label: '05', revenue: 120000, orders: 8 },
    { label: '10', revenue: 85000, orders: 6 },
    { label: '15', revenue: 210000, orders: 14 },
    { label: '20', revenue: 165000, orders: 11 },
    { label: '25', revenue: 290000, orders: 19 },
    { label: '30', revenue: 340000, orders: 23 },
  ],
  top_products: [
    { name: 'Hoodie Oversize Relentless', category: 'UB-LIFT', qty: 45 },
    { name: 'T-Shirt Signature UB', category: 'UB-BASKET', qty: 38 },
    { name: 'Sweat Crewneck Unstoppable', category: 'UB-LIFT', qty: 27 },
    { name: 'Casquette Focus & Conquer', category: 'UB-FOOT', qty: 19 },
    { name: 'Gourde Isotherme 750ml', category: 'UB-FOOT', qty: 12 },
  ],
  size_breakdown: [
    { size: 'S', qty: 32 },
    { size: 'M', qty: 58 },
    { size: 'L', qty: 47 },
    { size: 'XL', qty: 28 },
  ],
  pending_orders: [
    {
      id: 1,
      order_number: 'UB-2026-00187',
      customer_name: 'Moussa Diallo',
      customer_phone: '+221 77 123 45 67',
      shipping_city: 'Dakar',
      total: 53000,
      created_at: '2026-10-02T14:30:00',
    },
    {
      id: 2,
      order_number: 'UB-2026-00186',
      customer_name: 'Aïcha Ndiaye',
      customer_phone: '+221 78 987 65 43',
      shipping_city: 'Paris',
      total: 35000,
      created_at: '2026-10-02T11:15:00',
    },
    {
      id: 3,
      order_number: 'UB-2026-00185',
      customer_name: 'Jean Kouassi',
      customer_phone: '+225 07 555 44 33',
      shipping_city: 'Abidjan',
      total: 28000,
      created_at: '2026-10-01T18:45:00',
    },
  ],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCat, setSelectedCat] = useState('TOUTES');

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    // Utilisation directe des données mockées pour la démo
    setData(MOCK_DATA);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = (data?.top_products || []).filter((p) => {
    if (selectedCat === 'TOUTES') return true;
    return p.category === selectedCat;
  });

  const maxProductQty = Math.max(...(data?.top_products || []).map((p) => p.qty), 1);
  const totalSizesQty = (data?.size_breakdown || []).reduce((acc, curr) => acc + curr.qty, 0) || 1;

  const getKpiValue = (key) => {
    if (!data?.kpis) return 0;
    if (key === 'conv_rate') return data.kpis.conv_rate || 0;
    return data.kpis[key] || 0;
  };

  const getKpiDelta = (key) => {
    if (key === 'revenue' && data?.kpis?.prev_revenue > 0) {
      const pct = Math.abs(Math.round(((data.kpis.revenue - data.kpis.prev_revenue) / data.kpis.prev_revenue) * 100));
      const isUp = data.kpis.revenue >= data.kpis.prev_revenue;
      return { type: isUp ? 'up' : 'down', text: `${pct}% VS PÉR. PRÉC.` };
    }
    if (key === 'orders') {
      return { type: 'flat', text: period === 'day' ? "AUJOURD'HUI" : period === 'week' ? 'CETTE SEMAINE' : 'CE MOIS' };
    }
    if (key === 'avg_basket') {
      return { type: 'flat', text: 'VALEUR NETTE PAR PANIER' };
    }
    if (key === 'conv_rate') {
      return { type: 'flat', text: 'VISITEURS → COMMANDES' };
    }
    return { type: 'flat', text: '' };
  };

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">DASHBOARD ANALYTIQUE</p>
          <h1 className="admin-page-title">VUE D'ENSEMBLE</h1>
        </div>

        <div className="admin-period-tabs">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`admin-period-tab${period === key ? ' active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {loading ? (
        <div className="admin-spinner">
          <div className="admin-spinner-ring" />
        </div>
      ) : data ? (
        <>
          {/* ── 4 KPI Premium ── */}
          <div className="admin-kpi-grid">
            {KPI_CARDS.map(({ key, icon: Icon, label }) => {
              const delta = getKpiDelta(key);
              const isUp = delta.type === 'up';
              const isDown = delta.type === 'down';
              return (
                <div key={key} className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">{label}</span>
                    <div className="admin-kpi-icon">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">
                    {key === 'conv_rate' ? `${getKpiValue(key)}%` : fmtFCFA(getKpiValue(key))}
                  </div>
                  <div className={`admin-kpi-delta ${delta.type}`}>
                    {isUp && <TrendingUp size={14} />}
                    {isDown && <TrendingDown size={14} />}
                    <span>{delta.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Graphique des ventes ── */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">ÉVOLUTION DES VENTES DANS LE TEMPS</h3>
                <p className="admin-hint" style={{ marginTop: 4 }}>
                  COURBE DU CHIFFRE D'AFFAIRES SUR LA PÉRIODE SÉLECTIONNÉE
                </p>
              </div>
              <span className="admin-section-subtitle">
                {period === 'day' ? '24 HEURES' : period === 'week' ? '7 JOURS' : '30 JOURS'}
              </span>
            </div>

            {data.sales_chart && data.sales_chart.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sales_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#D9D7D2" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#8C8C8C"
                      fontSize={10}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={{ stroke: '#D9D7D2' }}
                    />
                    <YAxis
                      stroke="#8C8C8C"
                      fontSize={10}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}K` : val)}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0A0A0A"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                      activeDot={{ r: 5, fill: '#0A0A0A', stroke: '#F2F1EF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="admin-empty">
                <p className="admin-empty-label">AUCUNE VENTE ENREGISTRÉE SUR CETTE PÉRIODE</p>
                <p className="admin-empty-desc">Les données s'afficheront dès qu'une commande sera validée.</p>
              </div>
            )}
          </div>

          {/* ── Grille Prévision & Décision ── */}
          <div className="admin-grid-2">
            {/* Top Produits */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">PRODUITS LES PLUS VENDUS</h3>
                  <p className="admin-hint" style={{ marginTop: 4 }}>
                    CLASSEMENT PAR VOLUMES ET CATÉGORIES
                  </p>
                </div>
              </div>

              <div className="admin-category-filters">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`admin-category-pill${selectedCat === cat ? ' active' : ''}`}
                    onClick={() => setSelectedCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="admin-bar-list">
                  {filteredProducts.map((prod, idx) => (
                    <div key={idx} className="admin-bar-item">
                      <div className="admin-bar-meta">
                        <div>
                          <span className="admin-bar-title">{prod.name}</span>
                          <span className="admin-bar-category">{prod.category}</span>
                        </div>
                        <div className="admin-bar-numbers">
                          {prod.qty} UNITÉ{prod.qty > 1 ? 'S' : ''}
                        </div>
                      </div>
                      <div className="admin-bar-track">
                        <div
                          className="admin-bar-fill"
                          style={{ width: `${Math.max((prod.qty / maxProductQty) * 100, prod.qty > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty" style={{ padding: '32px 16px' }}>
                  <p className="admin-empty-label">AUCUN PRODUIT POUR CETTE CATÉGORIE</p>
                </div>
              )}
            </div>

            {/* Répartition par taille */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">RÉPARTITION PAR TAILLE</h3>
                  <p className="admin-hint" style={{ marginTop: 4 }}>
                    ANTICIPATION DU RÉASSORT & ÉTATS DE STOCK
                  </p>
                </div>
                <span className="admin-section-subtitle">S · M · L · XL</span>
              </div>

              {data.size_breakdown && data.size_breakdown.length > 0 ? (
                <div className="admin-bar-list" style={{ gap: '22px' }}>
                  {data.size_breakdown.map((item) => {
                    const pct = totalSizesQty > 0 ? Math.round((item.qty / totalSizesQty) * 100) : 0;
                    return (
                      <div key={item.size} className="admin-bar-item">
                        <div className="admin-bar-meta">
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                            TAILLE {item.size}
                          </span>
                          <span className="admin-bar-numbers">
                            {item.qty} VENDU{item.qty > 1 ? 'S' : ''} ({pct}%)
                          </span>
                        </div>
                        <div className="admin-bar-track" style={{ height: '8px' }}>
                          <div
                            className="admin-bar-fill"
                            style={{ width: `${Math.max(pct, item.qty > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-empty" style={{ padding: '32px 16px' }}>
                  <p className="admin-empty-label">AUCUNE DONNÉE DE TAILLE DISPONIBLE</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Dernières commandes ── */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">COMMANDES EN ATTENTE DE TRAITEMENT</h3>
                <p className="admin-hint" style={{ marginTop: 4 }}>
                  COMMANDES REQUÉRANT PRÉPARATION OU EXPÉDITION IMMÉDIATE
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => navigate('/admin/orders')}
              >
                TOUTES LES COMMANDES
              </button>
            </div>

            {data.pending_orders && data.pending_orders.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>N° COMMANDE</th>
                      <th>CLIENT</th>
                      <th>TÉLÉPHONE</th>
                      <th>VILLE DE LIVRAISON</th>
                      <th>TOTAL</th>
                      <th>DATE</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pending_orders.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: 800, letterSpacing: '0.08em' }}>
                          {ord.order_number}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {ord.customer_name}
                        </td>
                        <td style={{ color: '#8C8C8C', fontSize: '0.78rem' }}>
                          {ord.customer_phone || '—'}
                        </td>
                        <td>
                          {ord.shipping_city || '—'}
                        </td>
                        <td style={{ fontWeight: 800 }}>
                          {fmtFCFA(ord.total)}
                        </td>
                        <td style={{ color: '#8C8C8C', fontSize: '0.75rem' }}>
                          {new Date(ord.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.58rem' }}
                            onClick={() => navigate('/admin/orders')}
                          >
                            TRAITER
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">
                <div className="admin-empty-icon">✓</div>
                <p className="admin-empty-label">AUCUNE COMMANDE EN ATTENTE POUR LE MOMENT</p>
                <p className="admin-empty-desc">Toutes les commandes actuelles ont été traitées ou expédiées.</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
