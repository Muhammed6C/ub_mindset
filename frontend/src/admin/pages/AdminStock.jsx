import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, Search, Plus, Minus, LayoutGrid, List } from 'lucide-react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoProducts, adminDemoCategories } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';
import { getAdminProducts, getCachedAdminProducts, invalidateAdminProductsCache } from '../services/adminProductsCache';

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
  const [products, setProducts] = useState(() => getCachedAdminProducts() || adminDemoProducts);
  const [categories, setCategories] = useState(adminDemoCategories);
  const [loading, setLoading] = useState(() => !getCachedAdminProducts());
  const [productError, setProductError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [view, setView] = useState('table'); // 'table' | 'kanban'
  const [adjusting, setAdjusting] = useState(null);
  const [adjustVariantId, setAdjustVariantId] = useState('');
  const [adjustValue, setAdjustValue] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [isDemo, setIsDemo] = useState(() => !getCachedAdminProducts());
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [addStockProductId, setAddStockProductId] = useState('');
  const [addStockVariantId, setAddStockVariantId] = useState('');
  const [addStockQuantity, setAddStockQuantity] = useState('1');
  const [addStockReason, setAddStockReason] = useState('');
  const [addStockError, setAddStockError] = useState('');
  const [savingAddedStock, setSavingAddedStock] = useState(false);

  const loadProducts = useCallback(() => getAdminProducts()
      .then((items) => {
        setProducts(items);
        setIsDemo(false);
        setProductError('');
      })
      .catch((error) => {
        setProductError(error?.response?.data?.message || 'Le stock réel n’a pas pu être chargé.');
      })
      .finally(() => setLoading(false)), []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    api.get('/admin/categories')
      .then((response) => setCategories(response.data?.data || []))
      .catch(() => {
        setCategoryError('Les catégories n’ont pas pu être chargées.');
      });
  }, []);

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
    setAdjustVariantId(String(product.variants?.[0]?.id ?? ''));
    setAdjustValue(0);
    setAdjustReason('');
    setAdjustError('');
  };

  const selectedVariant = adjusting?.variants?.find((variant) => String(variant.id) === adjustVariantId);
  const selectedVariantStock = Number(selectedVariant?.stock) || 0;
  const addStockProduct = products.find((product) => String(product.id) === addStockProductId);
  const addStockVariant = addStockProduct?.variants?.find((variant) => String(variant.id) === addStockVariantId);

  const openAddStock = () => {
    const productWithVariants = products.find((product) => product.variants?.length);
    setAddStockProductId(String(productWithVariants?.id ?? ''));
    setAddStockVariantId(String(productWithVariants?.variants?.[0]?.id ?? ''));
    setAddStockQuantity('1');
    setAddStockReason('');
    setAddStockError('');
    setAddStockOpen(true);
  };

  const handleAddStock = async () => {
    const quantity = Number.parseInt(addStockQuantity, 10);
    if (!addStockProduct || !addStockVariant || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000000) {
      setAddStockError('Sélectionnez une variante et une quantité comprise entre 1 et 1 000 000.');
      return;
    }

    setSavingAddedStock(true);
    setAddStockError('');
    try {
      if (isDemo) {
        setProducts((items) => items.map((product) => {
          if (String(product.id) !== addStockProductId) return product;
          const variants = product.variants.map((variant) => (
            String(variant.id) === addStockVariantId
              ? { ...variant, stock: (Number(variant.stock) || 0) + quantity }
              : variant
          ));
          return { ...product, stock: getStock(product) + quantity, variants };
        }));
      } else {
        await api.post('/admin/stock/adjust', {
          product_variant_id: addStockVariant.id,
          type: 'in',
          quantity,
          reason: addStockReason.trim() || undefined,
        });
        invalidateAdminProductsCache();
        setLoading(true);
        await loadProducts();
      }
      setAddStockOpen(false);
    } catch (error) {
      setAddStockError(error?.response?.data?.message || 'L’ajout du stock a échoué.');
    } finally {
      setSavingAddedStock(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjusting || !selectedVariant || adjustValue === 0) return;
    if (adjustValue < -selectedVariantStock) {
      setAdjustError('La quantité retirée ne peut pas dépasser le stock de cette variante.');
      return;
    }

    setSavingAdjustment(true);
    setAdjustError('');
    const currentStock = getStock(adjusting);
    try {
      if (isDemo) {
        setProducts((items) => items.map((product) => {
          if (product.id !== adjusting.id) return product;
          const variants = product.variants.map((variant) => (
            String(variant.id) === adjustVariantId
              ? { ...variant, stock: selectedVariantStock + adjustValue }
              : variant
          ));
          return { ...product, stock: currentStock + adjustValue, variants };
        }));
      } else {
        await api.post('/admin/stock/adjust', {
          product_variant_id: selectedVariant.id,
          type: adjustValue > 0 ? 'in' : 'out',
          quantity: Math.abs(adjustValue),
          reason: adjustReason.trim() || undefined,
        });
        invalidateAdminProductsCache();
        setProductError('');
        setLoading(true);
        await loadProducts();
      }
      setAdjusting(null);
    } catch (err) {
      setAdjustError(err?.response?.data?.message || 'L’ajustement du stock a échoué.');
    } finally {
      setSavingAdjustment(false);
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
          <button type="button" className="is-dark" onClick={openAddStock} disabled={!products.some((product) => product.variants?.length)}>
            <Plus size={14} aria-hidden="true" /> AJOUTER UN STOCK
          </button>
        </div>
      </header>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}
      {(productError || categoryError) && (
        <div className="admin-alert-error" role="alert">
          {[productError, categoryError].filter(Boolean).join(' ')}
        </div>
      )}

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
            className="admin-input ub-admin-filter-input"
            placeholder="RECHERCHER UN PRODUIT…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-select ub-admin-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">TOUTES LES CATÉGORIES</option>
          {categories.map((cat) => (
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
        <div className="admin-table-wrap admin-stock-table-wrap">
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
                        {product.image || product.images?.[0]?.url ? (
                          <img
                            className="admin-product-thumb"
                            src={product.image || product.images[0].url}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="admin-product-thumb admin-product-thumb--empty">
                            <Package size={18} aria-hidden="true" />
                          </span>
                        )}
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
                      <span className={`admin-badge ${status === 'in_stock' ? 'admin-badge--success' : status === 'low' ? 'admin-badge--warning' : 'admin-badge--danger'}`}>
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
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && !savingAdjustment && setAdjusting(null)}>
          <div className="admin-modal admin-modal--stock admin-modal--category-style">
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">AJUSTEMENT DU STOCK</p>
                <h2 className="admin-modal-title">{adjusting.name}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !savingAdjustment && setAdjusting(null)}
                aria-label="Fermer"
                disabled={savingAdjustment}
              >
                ✕
              </button>
            </div>
            {adjusting.variants?.length > 1 && (
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="stock-variant">VARIANTE À AJUSTER</label>
                <select
                  id="stock-variant"
                  className="admin-select"
                  value={adjustVariantId}
                  onChange={(event) => { setAdjustVariantId(event.target.value); setAdjustValue(0); }}
                >
                  {adjusting.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {[variant.name || variant.size, variant.color, variant.sku].filter(Boolean).join(' · ') || `Variante ${variant.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedVariant ? (
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '20px' }}>
                Stock de cette variante : <strong>{selectedVariantStock}</strong> unités
              </p>
            ) : (
              <div className="admin-alert-error" role="alert">
                Aucune variante n’est configurée pour ce produit. Ajoute une variante avant d’ajuster son stock.
              </div>
            )}
            <div className="admin-stock-adjust__stepper">
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setAdjustValue((value) => Math.max(-selectedVariantStock, value - 1))}
                aria-label="Diminuer"
                disabled={!selectedVariant || adjustValue <= -selectedVariantStock}
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <input
                type="number"
                className="admin-input"
                style={{ textAlign: 'center', width: '100px' }}
                value={adjustValue}
                min={-selectedVariantStock}
                max={1000000}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  setAdjustValue(Number.isFinite(value) ? Math.max(-selectedVariantStock, value) : 0);
                }}
                disabled={!selectedVariant}
              />
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setAdjustValue((value) => Math.min(1000000, value + 1))}
                aria-label="Augmenter"
                disabled={!selectedVariant || adjustValue >= 1000000}
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="admin-stock-adjust__summary">
              <span>
                Nouveau stock : <strong>{Math.max(0, selectedVariantStock + adjustValue)}</strong> unités
              </span>
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="stock-reason">MOTIF (OPTIONNEL)</label>
              <input
                id="stock-reason"
                className="admin-input"
                maxLength={255}
                value={adjustReason}
                onChange={(event) => setAdjustReason(event.target.value)}
                placeholder="Ex. Réapprovisionnement"
              />
            </div>
            {adjustError && <div className="admin-alert-error" role="alert">{adjustError}</div>}
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setAdjusting(null)} disabled={savingAdjustment}>
                ANNULER
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleAdjust} disabled={!selectedVariant || adjustValue === 0 || savingAdjustment}>
                {savingAdjustment ? 'ENREGISTREMENT…' : 'ENREGISTRER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addStockOpen && (
        <div className="admin-modal-overlay" onClick={(event) => event.target === event.currentTarget && !savingAddedStock && setAddStockOpen(false)}>
          <div className="admin-modal admin-product-modal admin-add-stock-modal admin-modal--category-style" role="dialog" aria-modal="true" aria-labelledby="add-stock-title">
            <div className="admin-modal-header admin-product-modal__header">
              <div className="admin-product-modal__heading">
                <span className="admin-product-modal__icon" aria-hidden="true"><Package size={19} /></span>
                <div>
                  <p className="admin-modal-eyebrow">GESTION D’INVENTAIRE</p>
                  <h2 id="add-stock-title" className="admin-modal-title">AJOUTER UN STOCK</h2>
                  <p className="admin-product-modal__subtitle">Enregistrez un réapprovisionnement pour une variante.</p>
                </div>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => !savingAddedStock && setAddStockOpen(false)} aria-label="Fermer">✕</button>
            </div>
            {addStockError && <div className="admin-alert-error" role="alert">{addStockError}</div>}
            <div className="admin-product-form">
              <section className="admin-product-form__section">
                <div className="admin-product-form__section-heading">
                  <span>01</span>
                  <div><h3>Article à réapprovisionner</h3><p>Choisissez le produit et sa déclinaison dans le catalogue.</p></div>
                </div>
                <div className="admin-product-form__fields">
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="add-stock-product">PRODUIT *</label>
                    <select
                      id="add-stock-product"
                      className="admin-select"
                      value={addStockProductId}
                      onChange={(event) => {
                        const product = products.find((item) => String(item.id) === event.target.value);
                        setAddStockProductId(event.target.value);
                        setAddStockVariantId(String(product?.variants?.[0]?.id ?? ''));
                      }}
                    >
                      <option value="">SÉLECTIONNER UN PRODUIT</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id} disabled={!product.variants?.length}>
                          {product.name}{product.variants?.length ? '' : ' · AUCUNE VARIANTE'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group admin-product-form__field--full">
                    <label className="admin-label" htmlFor="add-stock-variant">VARIANTE *</label>
                    <select
                      id="add-stock-variant"
                      className="admin-select"
                      value={addStockVariantId}
                      onChange={(event) => setAddStockVariantId(event.target.value)}
                      disabled={!addStockProduct?.variants?.length}
                    >
                      <option value="">SÉLECTIONNER UNE VARIANTE</option>
                      {(addStockProduct?.variants || []).map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {[variant.name || variant.size, variant.color, variant.sku].filter(Boolean).join(' · ') || `Variante ${variant.id}`} · STOCK ACTUEL {Number(variant.stock) || 0}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
              <section className="admin-product-form__section">
                <div className="admin-product-form__section-heading">
                  <span>02</span>
                  <div><h3>Quantité reçue</h3><p>Cette entrée sera ajoutée au stock actuel et journalisée.</p></div>
                </div>
                <div className="admin-product-form__fields">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="add-stock-quantity">QUANTITÉ À AJOUTER *</label>
                    <input id="add-stock-quantity" className="admin-input" type="number" min="1" max="1000000" inputMode="numeric" value={addStockQuantity} onChange={(event) => setAddStockQuantity(event.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="add-stock-reason">MOTIF</label>
                    <input id="add-stock-reason" className="admin-input" maxLength={255} value={addStockReason} onChange={(event) => setAddStockReason(event.target.value)} placeholder="Ex. Réapprovisionnement" />
                  </div>
                </div>
                {addStockVariant && (
                  <p className="admin-add-stock-summary">
                    Nouveau stock estimé : <strong>{(Number(addStockVariant.stock) || 0) + (Number.parseInt(addStockQuantity, 10) || 0)} unités</strong>
                  </p>
                )}
              </section>
            </div>
            <div className="admin-modal-footer admin-product-modal__footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setAddStockOpen(false)} disabled={savingAddedStock}>ANNULER</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleAddStock} disabled={savingAddedStock || !addStockVariant}>
                {savingAddedStock ? 'ENREGISTREMENT…' : 'ENREGISTRER LE STOCK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
