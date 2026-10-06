import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import '../admin.css';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));

const EMPTY_FORM = {
  code: '',
  name: '',
  type: 'percentage',
  value: '',
  min_order_amount: '',
  usage_limit: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
};

export default function AdminPromotions() {
  const [promos, setPromos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPromotions = useCallback(() => {
    setLoading(true);
    api.get('/admin/promotions', { params: { page } })
      .then((res) => {
        setPromos(res.data.data || []);
        setMeta(res.data.meta);
      })
      .catch(() => {
        setPromos([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError('');
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      code: p.code,
      name: p.name,
      type: p.type,
      value: p.value,
      min_order_amount: p.min_order_amount || '',
      usage_limit: p.usage_limit || '',
      starts_at: p.starts_at ? p.starts_at.slice(0, 10) : '',
      ends_at: p.ends_at ? p.ends_at.slice(0, 10) : '',
      is_active: p.is_active,
    });
    setEditing(p);
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };

      if (editing) {
        await api.put(`/admin/promotions/${editing.id}`, payload);
      } else {
        await api.post('/admin/promotions', payload);
      }
      setModal(false);
      loadPromotions();
    } catch (err) {
      const errs = err?.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(' · ') : (err?.response?.data?.message || 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer définitivement le code promo "${p.code}" ?`)) return;
    try {
      await api.delete(`/admin/promotions/${p.id}`);
      loadPromotions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/admin/promotions/${p.id}`, { is_active: !p.is_active });
      loadPromotions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors du changement de statut.');
    }
  };

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">MARKETING & OFFRES</p>
          <h1 className="admin-page-title">PROMOTIONS</h1>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreate}
        >
          CRÉER UN CODE PROMO
        </button>
      </div>

      {/* ── Tableau des promotions ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-spinner">
            <div className="admin-spinner-ring" />
          </div>
        ) : promos.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUN CODE PROMO POUR LE MOMENT</p>
            <p className="admin-empty-desc">
              Créez des remises en pourcentage ou en montant fixe pour stimuler les conversions.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>INTITULÉ</th>
                <th>REMISE</th>
                <th>MINIMUM REQUIS</th>
                <th>UTILISATIONS</th>
                <th>EXPIRATION</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      fontSize: '0.92rem'
                    }}>
                      {p.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontWeight: 800 }}>
                    {p.type === 'percentage' ? `${p.value}%` : `${fmtFCFA(p.value)} FCFA`}
                  </td>
                  <td style={{ color: '#8C8C8C' }}>
                    {p.min_order_amount ? `${fmtFCFA(p.min_order_amount)} FCFA` : 'AUCUN'}
                  </td>
                  <td style={{ color: '#8C8C8C', fontWeight: 600 }}>
                    {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ''}
                  </td>
                  <td style={{ color: '#8C8C8C', fontSize: '0.75rem' }}>
                    {p.ends_at ? new Date(p.ends_at).toLocaleDateString('fr-FR') : 'ILLIMITÉE'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-badge ${p.is_active ? 'admin-badge--success' : 'admin-badge--muted'}`}
                      aria-pressed={p.is_active}
                      onClick={() => toggleActive(p)}
                      title="Cliquer pour basculer actif/inactif"
                    >
                      {p.is_active ? 'ACTIF' : 'INACTIF'}
                    </button>
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

      {/* ── Modale Création / Édition Code Promo ── */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="admin-modal">
            <p className="admin-modal-eyebrow">
              {editing ? 'MODIFICATION CODE' : 'NOUVELLE PROMOTION'}
            </p>
            <h2 className="admin-modal-title">
              {editing ? editing.code : 'CRÉER UN CODE PROMO'}
            </h2>

            {error && <div className="admin-alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div className="admin-form-group">
                <label className="admin-label">CODE PROMO *</label>
                <input
                  className="admin-input"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: MINDSET10"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.12em' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">INTITULÉ DE L'OFFRE *</label>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="EX: REMISE DE BIENVENUE"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">TYPE DE RÉDUCTION *</label>
                <select
                  className="admin-select"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="percentage">POURCENTAGE (%)</option>
                  <option value="fixed">MONTANT FIXE (FCFA)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  VALEUR * {form.type === 'percentage' ? '(MAX 100)' : '(FCFA)'}
                </label>
                <input
                  className="admin-input"
                  type="number"
                  min="0.01"
                  max={form.type === 'percentage' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">PANIER MINIMUM (FCFA)</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.min_order_amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, min_order_amount: e.target.value }))}
                  placeholder="0 (aucun minimum)"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">LIMITE D'UTILISATIONS TOTALES</label>
                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={(e) => setForm((prev) => ({ ...prev, usage_limit: e.target.value }))}
                  placeholder="Illimitée"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">DATE DE DÉBUT</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.starts_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, starts_at: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">DATE D'EXPIRATION</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.ends_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, ends_at: e.target.value }))}
                />
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="admin-checkbox-label">CODE PROMO ACTIF ET VALIDE</span>
                </label>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setModal(false)}
              >
                ANNULER
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'ENREGISTREMENT…' : editing ? 'ENREGISTRER' : 'CRÉER LE CODE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
