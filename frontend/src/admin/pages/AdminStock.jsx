import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, PackageCheck, PackageX, AlertTriangle, Search, Plus, Minus, LayoutGrid, List } from 'lucide-react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoProducts, adminDemoCategories } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Number(n) || 0);

const STOCK_STATUS = [
  { value: 'all', label: 'TOUS' },
  { value: 'in_stock', label: 'EN STOCK' },
  { value: 'low', label: 'STOCK FAIBLE' },
  { value: 'out', label: 'RUPTURE' },
];

const LOW_STOCK_THRESHOLD = 5;

const KANBAN_COLUMNS = [
  { id: 'in_stock', title: 'EN STOCK', color: '#10B981', bg: '#ECFDF5' },
  { id: 'low', title: 'STOCK FAIBLE', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'out', title: 'RUPTURE', color: '#EF4444', bg: '#FEF2F2' },
];

export default function AdminStock() {
  const [products, setProducts] = useState(adminDemoProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [view, setView] = useState('table'); // 'table' | 'kanban'
  const [adjusting, setAdjusting] = useState(null);
  const [adjustValue, setAdjustValue] = useState(0);
  const [isDemo, setIsDemo] = useState(true);

  const loadProducts = useCallback(() => {
    api.get('/admin/products', { params: { per_page: 60 } })
      .then((res) => {
        const items = res.data.data || [];
        if (items.length) {
          setIsDemo(false);
          setProducts(items);
        }
      })
      .catch(() => {
        // Conserve les données déjà affichées
      });
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const getStock = (product) => {
    if (typeof product?.stock === 'number') return product.stock;
    if (!Array.isArray(product?.variants) || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out';
    if (stock <= LOW_STOCK_THRESHOLD) return 'low';
    return 'in_stock';
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const stock = getStock(product);
      const status = getStockStatus(stock);
      const matchesSearch = !query || (product.name || '').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || String(product.category?.slug ?? product.category_id ?? '') === String(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const stocks = products.map((p) => getStock(p));
    return {
      total: stocks.reduce((sum, s) => sum + s, 0),
      inStock: stocks.filter((s) => s > LOW_STOCK_THRESHOLD).length,
      low: stocks.filter((s) => s > 0 && s <= LOW_STOCK_THRESHOLD).length,
      out: stocks.filter((s) => s === 0).length,
    };
  }, [products]);

  const kanbanData = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      items: filteredProducts.filter((p) => getStockStatus(getStock(p)) === col.id),
    }));
  }, [filteredProducts]);

  const openAdjust = (product) => {
    setAdjusting(product);
    setAdjustValue(0);
  };

  const handleAdjust = async () => {
    if (!adjusting || adjustValue === 0) return;
    const currentStock = getStock(adjusting);
    const newStock = Math.max(0, currentStock + adjustValue);
    if (isDemo) {
      setProducts((current) =>
        current.map((p) => p.id === adjusting.id ? { ...p, variants: [{ stock: newStock }] } : p)
      );
      setAdjusting(null);
      return;
    }
    try {
      await api.put(`/admin/products/${adjusting.id}`, { stock: newStock });
      setAdjusting(null);
      loadProducts();
    } catch (err) {
      alert("Erreur lors de l'ajustement du stock.");
    }
  };

  return (
    <div className="admin-page">
      {/* ── En-tête éditorial ── */}
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / INVENTAIRE</p>
          <h1>STOCK</h1>
          <span>Surveille les niveaux, anticipe les ruptures et ajuste les quantités en temps réel.</span>
        </div>
        <div className="ub-admin-page-lead__actions">
          <button type="button" className="is-dark" onClick={() => alert('Export CSV à implémenter')}>
            EXPORTER
          </button>
        </div>
      </header>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}

      {/* ── KPIs animés comme le dashboard ── */}
      <section className="admin-products-stats" aria-label="Synthèse du stock">
        <ProductStatCard icon="package" value={stats.total} label="UNITÉS EN STOCK" trend="+12%" period="ce mois" index={0} />
        <ProductStatCard icon="check" value={stats.inStock} label="PRODUITS EN STOCK" trend="+8%" period="ce mois" index={1} />
        <ProductStatCard icon="alert" value={stats.low} label="STOCK FAIBLE" trend="-5%" period="ce mois" index={2} />
        <ProductStatCard icon="x" value={stats.out} label="RUPTURES" trend="-2%" period="ce mois" index={3} />
      </section>

      {/* ── Barre d'outils ── */}
      <section className="admin-products-toolbar">
        <div className="admin-products-search">
          <Search size={16} aria-hidden="true" />
          <input
            className="admin-input"
            placeholder="RECHERCHER UN PRODUIT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">TOUTES LES CATÉGORIES</option>
          {adminDemoCategories.map((cat) => (
            <option key={cat.id} value={cat.slug || cat.id}>{(cat.name || '').toUpperCase()}</option>
          ))}
        </select>
        {/* Toggle vue tableau / kanban */}
        <div className="admin-products-viewtoggle" role="group" aria-label="Mode d'affichage">
          <button
            type="button"
            className={view === 'table' ? 'active' : ''}
            onClick={() => setView('table')}
            aria-label="Vue tableau"
            title="Vue tableau"
          >
            <List size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={view === 'kanban' ? 'active' : ''}
            onClick={() => setView('kanban')}
            aria-label="Vue kanban"
            title="Vue kanban"
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ── Filtres rapides ── */}
      <div className="admin-products-statusbar" role="group" aria-label="Filtrer par statut">
        {STOCK_STATUS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`admin-products-pill ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* ── Contenu : Tableau ou Kanban ── */}
      {loading ? (
        <div className="admin-spinner"><div className="admin-spinner-ring" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty-label">AUCUN PRODUIT</p>
          <p className="admin-empty-desc">Aucun produit ne correspond aux filtres sélectionnés.</p>
        </div>
      ) : view === 'table' ? (
        /* ── VUE TABLEAU ── */
        <div className="admin-table-wrap">
          <table className="admin-table admin-stock-table">
            <thead>
              <tr>
                <th>PRODUIT</th>
                <th>CATÉGORIE</th>
                <th>PRIX</th>
                <th>STOCK</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>AJUSTEMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = getStock(product);
                const status = getStockStatus(stock);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-thumb admin-product-thumb--empty">
                          <Package size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <div className="admin-product-cell__name">{product.name}</div>
                          {product.subtitle && <div className="admin-product-cell__sub">{product.subtitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="admin-products-table__muted">{product.category?.name || 'SANS CATÉGORIE'}</td>
                    <td className="admin-products-table__muted">{fmtFCFA(product.price)}</td>
                    <td>
                      <span className="admin-stock-value">{stock}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${status === 'in_stock' ? 'admin-badge-active' : status === 'low' ? 'admin-badge-warning' : 'admin-badge-inactive'}`}>
                        {status === 'in_stock' ? 'EN STOCK' : status === 'low' ? 'FAIBLE' : 'RUPTURE'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-products-table__actions">
                        <button type="button" className="admin-icon-btn" onClick={() => openAdjust(product)} aria-label="Ajuster le stock">
                          <Plus size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── VUE KANBAN ── */
        <div className="admin-kanban">
          {kanbanData.map((column) => (
            <div key={column.id} className="admin-kanban-col">
              <div className="admin-kanban-col-header" style={{ background: column.bg }}>
                <span className="admin-kanban-col-dot" style={{ background: column.color }} />
                <span className="admin-kanban-col-title">{column.title}</span>
                <span className="admin-kanban-col-count">{column.items.length}</span>
              </div>
              <div className="admin-kanban-col-body">
                {column.items.length === 0 ? (
                  <div className="admin-kanban-empty">Aucun produit</div>
                ) : (
                  column.items.map((product) => {
                    const stock = getStock(product);
                    return (
                      <div key={product.id} className="admin-kanban-card">
                        <div className="admin-kanban-card-header">
                          <div className="admin-kanban-card-icon">
                            <Package size={16} aria-hidden="true" />
                          </div>
                          <div className="admin-kanban-card-info">
                            <div className="admin-kanban-card-name">{product.name}</div>
                            <div className="admin-kanban-card-cat">{product.category?.name || 'SANS CATÉGORIE'}</div>
                          </div>
                        </div>
                        <div className="admin-kanban-card-stock">
                          <span className="admin-kanban-card-stock-value">{stock}</span>
                          <span className="admin-kanban-card-stock-label">unités</span>
                        </div>
                        <div className="admin-kanban-card-actions">
                          <button type="button" className="admin-kanban-card-btn" onClick={() => openAdjust(product)}>
                            <Plus size={14} aria-hidden="true" /> Ajuster
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modale d'ajustement ── */}
      {adjusting && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setAdjusting(null)}>
          <div className="admin-modal admin-modal--stock">
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">AJUSTEMENT DU STOCK</p>
                <h2 className="admin-modal-title">{adjusting.name}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setAdjusting(null)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '20px' }}>
              Stock actuel : <strong>{getStock(adjusting)}</strong> unités
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setAdjustValue((v) => v - 1)}
                aria-label="Diminuer"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <input
                type="number"
                className="admin-input"
                style={{ textAlign: 'center', width: '100px' }}
                value={adjustValue}
                onChange={(e) => setAdjustValue(parseInt(e.target.value) || 0)}
              />
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setAdjustValue((v) => v + 1)}
                aria-label="Augmenter"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '6px', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Nouveau stock : <strong>{Math.max(0, getStock(adjusting) + adjustValue)}</strong> unités
              </span>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setAdjusting(null)}>
                ANNULER
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleAdjust} disabled={adjustValue === 0}>
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
