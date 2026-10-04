import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import '../admin.css';
import { adminDemoCategories } from '../data/adminDemoData';
import ProductStatCard from '../components/ProductStatCard';

const EMPTY_CATEGORY = { name: '', slug: '', description: '', is_active: true };
const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState(adminDemoCategories);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(true);

  const loadCategories = useCallback(() => {
    api.get('/admin/categories')
      .then((res) => {
        const items = res.data.data || [];
        if (items.length) {
          setIsDemo(false);
          setCategories(items);
        }
      })
      .catch(() => {
        // Conserve les catégories déjà affichées
      });
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_CATEGORY); setError(''); setModal('create'); };
  const openEdit = (category) => { setEditing(category); setForm({ name: category.name || '', slug: category.slug || '', description: category.description || '', is_active: category.is_active ?? true }); setError(''); setModal('edit'); };
  const setName = (name) => setForm((current) => ({ ...current, name, slug: current.slug || slugify(name) }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (isDemo) {
        const next = { ...payload, id: editing?.id || Date.now(), products_count: editing?.products_count || 0 };
        setCategories((current) => modal === 'create' ? [next, ...current] : current.map((item) => item.id === editing.id ? next : item));
        setModal(null);
        return;
      }
      if (modal === 'create') await api.post('/admin/categories', payload);
      else await api.put(`/admin/categories/${editing.id}`, payload);
      setModal(null);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "La catégorie n'a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (!confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    try {
      if (isDemo) {
        setCategories((current) => current.filter((item) => item.id !== category.id));
        return;
      }
      await api.delete(`/admin/categories/${category.id}`);
      loadCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Suppression impossible : cette catégorie est peut-être utilisée par des produits.');
    }
  };

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.is_active).length,
    inactive: categories.filter((c) => !c.is_active).length,
    totalProducts: categories.reduce((sum, c) => sum + (c.products_count || 0), 0),
  };

  return (
    <div className="admin-page admin-page--categories">
      {/* ── En-tête éditorial ── */}
      <header className="ub-admin-page-lead">
        <div>
          <p>UB MINDSET / CATALOGUE</p>
          <h1>CATÉGORIES</h1>
          <span>Organise les terrains, collections et disciplines de la marque.</span>
        </div>
        <div className="ub-admin-page-lead__actions">
          <button type="button" className="is-dark" onClick={openCreate}>
            AJOUTER UNE CATÉGORIE
          </button>
        </div>
      </header>

      {isDemo && <p className="admin-demo-notice">APERÇU DE DÉMONSTRATION · MODIFICATIONS LOCALES UNIQUEMENT</p>}
      {error && !modal && <div className="admin-alert-error">{error}</div>}

      {/* ── KPIs animés comme le dashboard ── */}
      <section className="admin-products-stats" aria-label="Synthèse des catégories">
        <ProductStatCard
          icon="package"
          value={stats.total}
          label="CATÉGORIES"
          trend="+4%"
          period="ce mois"
          index={0}
        />
        <ProductStatCard
          icon="check"
          value={stats.active}
          label="ACTIVES"
          trend="+2%"
          period="ce mois"
          index={1}
        />
        <ProductStatCard
          icon="x"
          value={stats.inactive}
          label="MASQUÉES"
          trend="-1%"
          period="ce mois"
          index={2}
        />
        <ProductStatCard
          icon="star"
          value={stats.totalProducts}
          label="PRODUITS LIÉS"
          trend="+18%"
          period="ce mois"
          index={3}
        />
      </section>

      {/* ── Grille des catégories ── */}
      <section className="admin-category-grid" aria-label="Catégories du catalogue">
        {loading ? (
          <div className="admin-spinner"><div className="admin-spinner-ring" /></div>
        ) : categories.length ? (
          categories.map((category, index) => (
            <article className="admin-category-card" key={category.id}>
              <div className="admin-category-card__index">{String(index + 1).padStart(2, '0')}</div>
              <div className="admin-category-card__main">
                <span className={`admin-badge ${category.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                  {category.is_active ? 'ACTIVE' : 'MASQUÉE'}
                </span>
                <h2>{category.name}</h2>
                <p>{category.description || 'Aucune description définie pour cette catégorie.'}</p>
                <small>/{category.slug || slugify(category.name)} · {category.products_count ?? 0} PRODUIT{(category.products_count ?? 0) > 1 ? 'S' : ''}</small>
              </div>
              <div className="admin-category-card__actions">
                <button type="button" onClick={() => openEdit(category)}>ÉDITER</button>
                <button type="button" onClick={() => remove(category)}>SUPPRIMER</button>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUNE CATÉGORIE</p>
            <p className="admin-empty-desc">Crée ta première discipline pour structurer le catalogue.</p>
          </div>
        )}
      </section>

      {/* ── Modale Création / Édition ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={(event) => event.target === event.currentTarget && setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">{modal === 'create' ? 'NOUVELLE CATÉGORIE' : 'MODIFICATION CATÉGORIE'}</p>
                <h2 className="admin-modal-title">{modal === 'create' ? 'STRUCTURER LE CATALOGUE' : editing?.name}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            {error && <div className="admin-alert-error">{error}</div>}
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="category-name">NOM *</label>
              <input id="category-name" className="admin-input" value={form.name} onChange={(event) => setName(event.target.value)} placeholder="EX : UB-FOOT" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="category-slug">IDENTIFIANT URL</label>
              <input id="category-slug" className="admin-input" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} placeholder="ub-foot" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="category-description">DESCRIPTION</label>
              <textarea id="category-description" className="admin-input" rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Une phrase courte pour préciser l'univers de la catégorie." />
            </div>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />
              <span className="admin-checkbox-label">VISIBLE DANS LE CATALOGUE</span>
            </label>
            <footer className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>ANNULER</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'ENREGISTREMENT…' : 'ENREGISTRER'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
