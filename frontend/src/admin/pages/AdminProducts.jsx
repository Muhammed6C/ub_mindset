import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import '../admin.css';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';

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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    api.get('/admin/products', { params })
      .then((res) => {
        setProducts(res.data.data || []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data.data || []));
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError('');
    setModal('create');
  };

  const openEdit = (p) => {
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

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      };

      if (modal === 'create') {
        await api.post('/admin/products', payload);
      } else {
        await api.put(`/admin/products/${editing.id}`, payload);
      }
      setModal(null);
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
      await api.delete(`/admin/products/${p.id}`);
      loadProducts();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">CATALOGUE DE LA MARQUE</p>
          <h1 className="admin-page-title">PRODUITS</h1>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreate}
        >
          AJOUTER UN PRODUIT
        </button>
      </div>

      {/* ── Barre de recherche ── */}
      <div style={{ marginBottom: '28px' }}>
        <input
          className="admin-input"
          style={{ maxWidth: '340px' }}
          placeholder="RECHERCHER DANS LE CATALOGUE…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tableau des produits ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-spinner">
            <div className="admin-spinner-ring" />
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUN PRODUIT DISPONIBLE</p>
            <p className="admin-empty-desc">
              {search ? 'Aucun produit ne correspond à votre recherche.' : 'Commencez par ajouter votre premier produit.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>PRODUIT</th>
                <th>CATÉGORIE</th>
                <th>PRIX</th>
                <th>STATUT</th>
                <th>BADGES & LABELS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {p.name}
                    </div>
                    {p.subtitle && (
                      <div style={{ fontSize: '0.72rem', color: '#8C8C8C', marginTop: 2 }}>
                        {p.subtitle}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#8C8C8C', fontWeight: 600 }}>
                    {p.category?.name || 'SANS CATÉGORIE'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800 }}>{fmtFCFA(p.price)}</span>
                    {p.original_price && (
                      <span style={{ textDecoration: 'line-through', color: '#8C8C8C', fontSize: '0.75rem', marginLeft: 8 }}>
                        {fmtFCFA(p.original_price)}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge ${p.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {p.is_active ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.68rem', color: '#8C8C8C', fontWeight: 700, letterSpacing: '0.1em' }}>
                      {[p.is_new && 'NOUVEAU', p.is_featured && 'VEDETTE', p.tag].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '0.58rem' }}
                        onClick={() => openEdit(p)}
                      >
                        ÉDITER
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '8px 12px', fontSize: '0.58rem' }}
                        onClick={() => handleDelete(p)}
                      >
                        SUPPRIMER
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modale Création / Édition Produit ── */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="admin-modal">
            <p className="admin-modal-eyebrow">
              {modal === 'create' ? 'NOUVEAU PRODUIT' : 'MODIFICATION PRODUIT'}
            </p>
            <h2 className="admin-modal-title">
              {modal === 'create' ? 'AJOUT AU CATALOGUE' : editing?.name}
            </h2>

            {error && <div className="admin-alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div style={{ gridColumn: '1 / -1' }} className="admin-form-group">
                <label className="admin-label">NOM DU PRODUIT *</label>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="EX: T-SHIRT SIGNATURE UB HEAVYWEIGHT"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }} className="admin-form-group">
                <label className="admin-label">SOUS-TITRE OU COUPE</label>
                <input
                  className="admin-input"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="EX: COUPE OVERSIZED DROP SHOULDER"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">PRIX DE VENTE (FCFA) *</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">PRIX INITIAL BARRÉ (FCFA)</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.original_price}
                  onChange={(e) => setForm((prev) => ({ ...prev, original_price: e.target.value }))}
                  placeholder="Laisser vide si pas de promotion"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }} className="admin-form-group">
                <label className="admin-label">CATÉGORIE / DISCIPLINE</label>
                <select
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

              <div style={{ gridColumn: '1 / -1' }} className="admin-form-group">
                <label className="admin-label">DESCRIPTION</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails de la matière, grammage, coupe…"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">TAG SPÉCIAL</label>
                <input
                  className="admin-input"
                  value={form.tag}
                  onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                  placeholder="EX: BESTSELLER"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
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
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setModal(null)}
              >
                ANNULER
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'ENREGISTREMENT…' : modal === 'create' ? 'CRÉER LE PRODUIT' : 'ENREGISTRER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
