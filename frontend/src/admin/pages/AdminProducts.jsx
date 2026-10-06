import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ImagePlus,
  LayoutGrid,
  List,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoCategories, adminDemoProducts } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';
import { getAdminProducts, getCachedAdminProducts, invalidateAdminProductsCache } from '../services/adminProductsCache';
import { convertProductImageToWebp, readImageAsDataUrl } from '../utils/productImage';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'latest', label: 'PLUS RÉCENTS' },
  { value: 'oldest', label: 'PLUS ANCIENS' },
  { value: 'price_desc', label: 'PRIX DÉCROISSANT' },
  { value: 'price_asc', label: 'PRIX CROISSANT' },
  { value: 'name', label: 'NOM (A → Z)' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'TOUS' },
  { value: 'active', label: 'ACTIFS' },
  { value: 'inactive', label: 'INACTIFS' },
  { value: 'featured', label: 'VEDETTES' },
];

/** Image principale d'un produit (image directe ou première image de galerie). */
const productImage = (product) => product?.image || product?.images?.[0]?.url || null;

/** Somme du stock des variantes, ou stock direct du produit. */
const productStock = (product) => {
  if (typeof product?.stock === 'number') return product.stock;
  if (!Array.isArray(product?.variants) || product.variants.length === 0) return null;
  return product.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
};

/** Tri local du catalogue (les données sont chargées en une seule requête). */
const sortProducts = (list, sort) => {
  const copy = [...list];
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => (a.id || 0) - (b.id || 0));
    case 'price_desc':
      return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'price_asc':
      return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'name':
      return copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    default:
      return copy.sort((a, b) => (b.id || 0) - (a.id || 0));
  }
};

const EMPTY_FORM = {
  name: '',
  subtitle: '',
  description: '',
  price: '',
  original_price: '',
  category_id: '',
  is_active: true,
  is_new: false,
  is_featured: false,
  tag: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState(() => getCachedAdminProducts() ?? adminDemoProducts);
  const [categories, setCategories] = useState(adminDemoCategories);
  const [loading, setLoading] = useState(() => getCachedAdminProducts() === undefined);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('latest');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isDemo, setIsDemo] = useState(() => getCachedAdminProducts() === undefined);
  const imageSelectionRef = useRef(0);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const loadProducts = useCallback(() => {
    // Le catalogue est chargé en arrière-plan sans bloquer l'affichage immédiat
    getAdminProducts()
      .then((items) => {
        setIsDemo(false);
        setProducts(items);
        setLoadError('');
      })
      .catch((loadFailure) => {
        setLoadError(loadFailure?.response?.data?.message || 'Le catalogue n’a pas pu être actualisé.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    api.get('/admin/categories')
      .then((res) => {
        if (res.data.data?.length) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {
        setLoadError((current) => current || 'Les catégories n’ont pas pu être chargées.');
      });
  }, []);

  // Chaque changement de filtre remet la liste à la première page (voir handlers).
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesSearch = !query
        || (product.name || '').toLowerCase().includes(query)
        || (product.subtitle || '').toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all'
        || String(product.category?.slug ?? product.category_id ?? '') === String(categoryFilter);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && product.is_active)
        || (statusFilter === 'inactive' && !product.is_active)
        || (statusFilter === 'featured' && product.is_featured);
      return matchesSearch && matchesCategory && matchesStatus;
    });
    return sortProducts(list, sort);
  }, [products, search, categoryFilter, statusFilter, sort]);

  const stats = useMemo(() => ({
    total: filteredProducts.length,
    active: filteredProducts.filter((product) => product.is_active).length,
    inactive: filteredProducts.filter((product) => !product.is_active).length,
    featured: filteredProducts.filter((product) => product.is_featured).length,
  }), [filteredProducts]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    imageSelectionRef.current += 1;
    setForm(EMPTY_FORM);
    setSelectedImage(null);
    setImagePreview('');
    setImageProcessing(false);
    setEditing(null);
    setError('');
    setModal('create');
  };

  const openEdit = (p) => {
    imageSelectionRef.current += 1;
    setSelectedImage(null);
    setImagePreview('');
    setImageProcessing(false);
    setForm({
      name: p.name || '',
      subtitle: p.subtitle || '',
      description: p.description || '',
      price: p.price || '',
      original_price: p.original_price || '',
      category_id: p.category_id || '',
      is_active: p.is_active ?? true,
      is_new: p.is_new ?? false,
      is_featured: p.is_featured ?? false,
      tag: p.tag || '',
    });
    setEditing(p);
    setError('');
    setModal('edit');
  };

  const closeModal = () => {
    imageSelectionRef.current += 1;
    setSelectedImage(null);
    setImagePreview('');
    setImageProcessing(false);
    setModal(null);
  };

  const handleImageSelection = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const selectionId = ++imageSelectionRef.current;
    setImageProcessing(true);
    setError('');
    try {
      const webpFile = await convertProductImageToWebp(file);
      if (selectionId === imageSelectionRef.current) {
        setSelectedImage(webpFile);
        setImagePreview(URL.createObjectURL(webpFile));
      }
    } catch (imageError) {
      if (selectionId === imageSelectionRef.current) {
        setError(imageError?.message || 'La photo n’a pas pu être préparée.');
      }
    } finally {
      if (selectionId === imageSelectionRef.current) setImageProcessing(false);
    }
  };

  const handleSave = async () => {
    if (imageProcessing) return;
    if (form.name.trim().length < 2) {
      setError('Le nom du produit doit contenir au moins 2 caractères.');
      return;
    }
    if (form.original_price && Number(form.original_price) < (Number(form.price) || 0)) {
      setError('Le prix initial doit être supérieur ou égal au prix de vente.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      let imageUrl;
      if (selectedImage) {
        if (isDemo) {
          imageUrl = await readImageAsDataUrl(selectedImage);
        } else {
          const upload = new FormData();
          upload.append('file', selectedImage);
          upload.append('is_public', 'true');
          const mediaResponse = await api.post('/admin/media', upload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          imageUrl = mediaResponse.data?.data?.url;
          if (!imageUrl) throw new Error('Le serveur n’a pas retourné l’adresse de la photo.');
        }
      }

      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        ...(imageUrl ? { image: imageUrl } : {}),
      };

      if (isDemo) {
        const category = categories.find((item) => item.id === payload.category_id) || null;
        const demoProduct = { ...payload, id: editing?.id || Date.now(), category };
        setProducts((current) => modal === 'create' ? [demoProduct, ...current] : current.map((item) => item.id === editing.id ? demoProduct : item));
        closeModal();
        return;
      }
      if (modal === 'create') {
        await api.post('/admin/products', payload);
      } else {
        await api.put(`/admin/products/${editing.id}`, payload);
      }
      invalidateAdminProductsCache();
      closeModal();
      loadProducts();
    } catch (err) {
      const errs = err?.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(' · ') : (err?.response?.data?.message || 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer définitivement le produit "${p.name}" ?`)) return;
    try {
      if (isDemo) {
        setProducts((current) => current.filter((item) => item.id !== p.id));
        return;
      }
      await api.delete(`/admin/products/${p.id}`);
      invalidateAdminProductsCache();
      loadProducts();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSort('latest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search) || categoryFilter !== 'all' || statusFilter !== 'all' || sort !== 'latest';

  return (
    <div className="admin-page">
      {/* ── En-tête éditorial ── */}
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / CATALOGUE</p>
          <h1>PRODUITS</h1>
          <span>Pilote le catalogue : prix, statut, mise en avant et disponibilité en un coup d'œil.</span>
        </div>
        <div className="ub-admin-page-lead__actions">
          <button type="button" className="is-dark" onClick={openCreate}>
            <Plus size={16} aria-hidden="true" />
            AJOUTER UN PRODUIT
          </button>
        </div>
      </header>

      {isDemo && (
        <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>
      )}
      {loadError && <div className="admin-alert-error" role="alert">{loadError}</div>}

      {/* ── Synthèse du catalogue — KPIs animés comme le dashboard ── */}
      <section className="admin-products-stats" aria-label="Synthèse du catalogue">
        <ProductStatCard
          icon="package"
          value={stats.total}
          label="PRODUITS LISTÉS"
          trend="+12%"
          period="ce mois"
          index={0}
        />
        <ProductStatCard
          icon="check"
          value={stats.active}
          label="ACTIFS"
          trend="+8%"
          period="ce mois"
          index={1}
        />
        <ProductStatCard
          icon="x"
          value={stats.inactive}
          label="INACTIFS"
          trend="-3%"
          period="ce mois"
          index={2}
        />
        <ProductStatCard
          icon="star"
          value={stats.featured}
          label="VEDETTES"
          trend="+15%"
          period="ce mois"
          index={3}
        />
      </section>

      {/* ── Barre d'outils ── */}
      <section className="admin-products-toolbar">
        <div className="admin-products-search">
          <Search size={16} aria-hidden="true" />
          <input
            className="admin-input ub-admin-filter-input"
            placeholder="RECHERCHER UN PRODUIT…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-select ub-admin-filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="all">TOUTES LES CATÉGORIES</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug || category.id}>
              {(category.name || '').toUpperCase()}
            </option>
          ))}
        </select>
        <select className="admin-select ub-admin-filter-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="admin-products-viewtoggle" role="group" aria-label="Mode d'affichage">
          <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => { setView('grid'); setPage(1); }} aria-label="Vue grille">
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
          <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => { setView('table'); setPage(1); }} aria-label="Vue tableau">
            <List size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ── Filtres rapides de statut ── */}
      <div className="admin-products-statusbar" role="group" aria-label="Filtrer par statut">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`admin-products-pill ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* ── Liste des produits ── */}
      {loading ? (
        <div className="admin-spinner">
          <div className="admin-spinner-ring" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty-label">AUCUN PRODUIT</p>
          <p className="admin-empty-desc">
            {hasActiveFilters
              ? 'Aucun produit ne correspond aux filtres sélectionnés.'
              : 'Commence par ajouter ton premier produit au catalogue.'}
          </p>
          {hasActiveFilters && (
            <button type="button" className="admin-btn admin-btn-ghost" onClick={resetFilters}>
              RÉINITIALISER LES FILTRES
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="admin-products-grid">
          {pageItems.map((product) => {
            const stock = productStock(product);
            return (
              <article className="admin-product-card" key={product.id}>
                <div className="admin-product-card__media">
                  {productImage(product) ? (
                    <img src={productImage(product)} alt={product.name} loading="lazy" />
                  ) : (
                    <span className="admin-product-card__placeholder"><Package size={30} aria-hidden="true" /></span>
                  )}
                  <div className="admin-product-card__badges">
                    <span className={`admin-badge ${product.is_active ? 'admin-badge--success' : 'admin-badge--muted'}`}>
                      {product.is_active ? 'ACTIF' : 'INACTIF'}
                    </span>
                    {product.is_new && <span className="admin-badge admin-badge--accent">NOUVEAU</span>}
                    {product.is_featured && <span className="admin-badge admin-badge--featured">VEDETTE</span>}
                  </div>
                </div>
                <div className="admin-product-card__body">
                  <span className="admin-product-card__cat">{product.category?.name || 'SANS CATÉGORIE'}</span>
                  <h3 className="admin-product-card__name">{product.name}</h3>
                  {product.subtitle && <span className="admin-product-card__sub">{product.subtitle}</span>}
                  <div className="admin-product-card__row">
                    <span className="admin-product-card__price">
                      {fmtFCFA(product.price)}
                      {product.original_price && (
                        <span className="admin-product-card__price-old">{fmtFCFA(product.original_price)}</span>
                      )}
                    </span>
                    {stock !== null && (
                      <span className={`admin-product-card__stock ${stock === 0 ? 'out' : stock <= 5 ? 'low' : ''}`}>
                        <Package size={13} aria-hidden="true" /> {stock} EN STOCK
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-product-card__actions">
                  <button type="button" onClick={() => openEdit(product)}>
                    <Pencil size={14} aria-hidden="true" /> ÉDITER
                  </button>
                  <button type="button" className="is-danger" onClick={() => handleDelete(product)}>
                    <Trash2 size={14} aria-hidden="true" /> SUPPRIMER
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-table-wrap admin-products-table-wrap">
          <table className="admin-table admin-products-table">
            <thead>
              <tr>
                <th>PRODUIT</th>
                <th>CATÉGORIE</th>
                <th>PRIX</th>
                <th>STOCK</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => {
                const stock = productStock(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {productImage(product) ? (
                          <img className="admin-product-thumb" src={productImage(product)} alt={product.name} loading="lazy" />
                        ) : (
                          <span className="admin-product-thumb admin-product-thumb--empty"><Package size={18} aria-hidden="true" /></span>
                        )}
                        <div>
                          <div className="admin-product-cell__name">{product.name}</div>
                          {product.subtitle && <div className="admin-product-cell__sub">{product.subtitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="admin-products-table__muted">{product.category?.name || 'SANS CATÉGORIE'}</td>
                    <td>
                      <span className="admin-product-cell__name">{fmtFCFA(product.price)}</span>
                      {product.original_price && (
                        <span className="admin-product-card__price-old">{fmtFCFA(product.original_price)}</span>
                      )}
                    </td>
                    <td className="admin-products-table__muted">{stock === null ? '—' : stock}</td>
                    <td>
                      <span className={`admin-badge ${product.is_active ? 'admin-badge--success' : 'admin-badge--muted'}`}>
                        {product.is_active ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-products-table__actions">
                        <button type="button" className="admin-icon-btn" onClick={() => openEdit(product)} aria-label="Éditer">
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button type="button" className="admin-icon-btn is-danger" onClick={() => handleDelete(product)} aria-label="Supprimer">
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="admin-products-pagination">
          <span className="admin-products-pagination__info">
            {filteredProducts.length} PRODUIT{filteredProducts.length > 1 ? 'S' : ''} · PAGE {currentPage} / {totalPages}
          </span>
          <div className="admin-products-pagination__controls">
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>‹ PRÉC.</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className={number === currentPage ? 'active' : ''}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>SUIV. ›</button>
          </div>
        </div>
      )}

      {/* ── Modale Création / Édition Produit ── */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="admin-modal admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="admin-modal-header admin-product-modal__header">
              <div className="admin-product-modal__heading">
                <span className="admin-product-modal__icon" aria-hidden="true"><Package size={19} /></span>
                <div>
                  <p className="admin-modal-eyebrow">
                    {modal === 'create' ? 'NOUVEAU PRODUIT' : 'MODIFICATION PRODUIT'}
                  </p>
                  <h2 id="product-modal-title" className="admin-modal-title">
                    {modal === 'create' ? 'AJOUT AU CATALOGUE' : editing?.name}
                  </h2>
                  <p className="admin-product-modal__subtitle">
                    Renseignez les informations essentielles pour présenter votre produit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {error && <div className="admin-alert-error" role="alert">{error}</div>}

            <div className="admin-product-form">
              <section className="admin-product-form__section" aria-labelledby="product-photo-heading">
                <div className="admin-product-form__section-heading">
                  <span>01</span>
                  <div>
                    <h3 id="product-photo-heading">Photo du produit</h3>
                    <p>Choisissez une image nette ; les formats pris en charge seront convertis en WebP.</p>
                  </div>
                </div>
                <div className="admin-product-image">
                  <div className="admin-product-image__preview">
                    {(imagePreview || productImage(editing)) ? (
                      <img src={imagePreview || productImage(editing)} alt="Aperçu du produit" />
                    ) : (
                      <ImagePlus size={25} aria-hidden="true" />
                    )}
                  </div>
                  <div className="admin-product-image__content">
                    <strong>
                      {imageProcessing ? 'CONVERSION EN WEBP…' : selectedImage?.name || (productImage(editing) ? 'PHOTO ACTUELLE' : 'AUCUNE PHOTO SÉLECTIONNÉE')}
                    </strong>
                    <p>JPEG, PNG, GIF, AVIF, BMP ou WebP · conversion automatique</p>
                    <div className="admin-product-image__actions">
                      <label className="admin-product-image__choose" htmlFor="product-photo">
                        <ImagePlus size={14} aria-hidden="true" />
                        {selectedImage || productImage(editing) ? 'CHOISIR UNE AUTRE PHOTO' : 'CHOISIR UNE PHOTO'}
                        <input
                          id="product-photo"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/avif,image/bmp,image/webp"
                          onChange={handleImageSelection}
                          disabled={imageProcessing || saving}
                        />
                      </label>
                      {selectedImage && (
                        <button
                          type="button"
                          className="admin-product-image__remove"
                          onClick={() => {
                            imageSelectionRef.current += 1;
                            setSelectedImage(null);
                            setImagePreview('');
                            setError('');
                          }}
                          aria-label="Retirer la photo sélectionnée"
                        >
                          <X size={14} aria-hidden="true" />
                          RETIRER
                        </button>
                      )}
                    </div>
                    {selectedImage?.type === 'image/webp' && (
                      <span className="admin-product-image__format">IMAGE WEBP PRÊTE À L’ENVOI</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="admin-product-form__section" aria-labelledby="product-identity-heading">
                <div className="admin-product-form__section-heading">
                  <span>02</span>
                  <div>
                    <h3 id="product-identity-heading">Identité du produit</h3>
                    <p>Le nom et la coupe qui apparaîtront dans votre boutique.</p>
                  </div>
                </div>
                <div className="admin-product-form__fields">
              <div className="admin-form-group admin-product-form__field--full">
                <label className="admin-label" htmlFor="product-name">NOM DU PRODUIT *</label>
                <input
                  id="product-name"
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="EX: T-SHIRT SIGNATURE UB HEAVYWEIGHT"
                />
              </div>

              <div className="admin-form-group admin-product-form__field--full">
                <label className="admin-label" htmlFor="product-subtitle">SOUS-TITRE OU COUPE</label>
                <input
                  id="product-subtitle"
                  className="admin-input"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="EX: COUPE OVERSIZED DROP SHOULDER"
                />
              </div>
                </div>
              </section>

              <section className="admin-product-form__section" aria-labelledby="product-pricing-heading">
                <div className="admin-product-form__section-heading">
                  <span>03</span>
                  <div>
                    <h3 id="product-pricing-heading">Tarification</h3>
                    <p>Définissez le prix affiché et, si besoin, le prix avant réduction.</p>
                  </div>
                </div>
                <div className="admin-product-form__fields">
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="product-price">PRIX DE VENTE (FCFA) *</label>
                <input
                  id="product-price"
                  className="admin-input"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="EX: 25000"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="product-original-price">PRIX INITIAL BARRÉ (FCFA)</label>
                <input
                  id="product-original-price"
                  className="admin-input"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.original_price}
                  onChange={(e) => setForm((prev) => ({ ...prev, original_price: e.target.value }))}
                  placeholder="Laisser vide si pas de promotion"
                />
              </div>
                </div>
              </section>

              <section className="admin-product-form__section" aria-labelledby="product-details-heading">
                <div className="admin-product-form__section-heading">
                  <span>04</span>
                  <div>
                    <h3 id="product-details-heading">Détails & classement</h3>
                    <p>Aidez vos clients à découvrir et reconnaître le produit.</p>
                  </div>
                </div>
                <div className="admin-product-form__fields">
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="product-category">CATÉGORIE / DISCIPLINE</label>
                <select
                  id="product-category"
                  className="admin-select"
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">SANS CATÉGORIE</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="product-tag">TAG SPÉCIAL</label>
                <input
                  id="product-tag"
                  className="admin-input"
                  value={form.tag}
                  onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                  placeholder="EX: BESTSELLER"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="admin-form-group admin-product-form__field--full">
                <label className="admin-label" htmlFor="product-description">DESCRIPTION</label>
                <textarea
                  id="product-description"
                  className="admin-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails de la matière, grammage, coupe…"
                />
              </div>
                </div>
              </section>

              <section className="admin-product-form__section admin-product-form__section--options" aria-labelledby="product-visibility-heading">
                <div className="admin-product-form__section-heading">
                  <span>05</span>
                  <div>
                    <h3 id="product-visibility-heading">Visibilité & mise en avant</h3>
                    <p>Choisissez comment le produit sera présenté sur le site.</p>
                  </div>
                </div>
                <div className="admin-product-form__options">
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="admin-checkbox-label">PRODUIT ACTIF SUR LE SITE</span>
                </label>

                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_new: e.target.checked }))}
                  />
                  <span className="admin-checkbox-label">BADGE NOUVEAU</span>
                </label>

                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  <span className="admin-checkbox-label">MIS EN VEDETTE SUR L'ACCUEIL</span>
                </label>
                </div>
              </section>
            </div>

            <div className="admin-modal-footer admin-product-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={closeModal}
              >
                ANNULER
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving || imageProcessing}
              >
                {imageProcessing ? 'PRÉPARATION DE LA PHOTO…' : saving ? 'ENREGISTREMENT…' : modal === 'create' ? 'ENREGISTRER LE PRODUIT' : 'ENREGISTRER LES MODIFICATIONS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
