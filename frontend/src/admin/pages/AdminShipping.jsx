import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import '../admin.css';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';

const EMPTY_FORM = {
  name: '',
  code: '',
  country_code: 'SN',
  city: '',
  cost: '',
  free_over: '',
  estimated_days: '',
  is_active: true,
  position: 0,
};

export default function AdminShipping() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadZones = useCallback(() => {
    setLoading(true);
    api.get('/admin/shipping-zones')
      .then((res) => {
        setZones(res.data.data || []);
      })
      .catch(() => {
        setZones([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError('');
    setModal(true);
  };

  const openEdit = (z) => {
    setForm({
      name: z.name,
      code: z.code,
      country_code: z.country_code,
      city: z.city || '',
      cost: z.cost,
      free_over: z.free_over ?? '',
      estimated_days: z.estimated_days || '',
      is_active: z.is_active,
      position: z.position ?? 0,
    });
    setEditing(z);
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        cost: parseFloat(form.cost) || 0,
        free_over: form.free_over !== '' ? parseFloat(form.free_over) : null,
        position: parseInt(form.position) || 0,
      };

      if (editing) {
        await api.put(`/admin/shipping-zones/${editing.id}`, payload);
      } else {
        await api.post('/admin/shipping-zones', payload);
      }
      setModal(false);
      loadZones();
    } catch (err) {
      const errs = err?.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(' · ') : (err?.response?.data?.message || 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (z) => {
    if (!confirm(`Supprimer la zone de livraison "${z.name}" ?`)) return;
    try {
      await api.delete(`/admin/shipping-zones/${z.id}`);
      loadZones();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const toggleActive = async (z) => {
    try {
      await api.put(`/admin/shipping-zones/${z.id}`, { is_active: !z.is_active });
      loadZones();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de la modification.');
    }
  };

  const FIELDS = [
    { key: 'name', label: 'NOM DE LA ZONE *', type: 'text', placeholder: 'EX: DAKAR & BANLIEUE' },
    { key: 'code', label: 'CODE UNIQUE *', type: 'text', placeholder: 'EX: DKR', style: { textTransform: 'uppercase', fontFamily: 'monospace' } },
    { key: 'country_code', label: 'CODE PAYS (ISO) *', type: 'text', placeholder: 'SN', style: { textTransform: 'uppercase' }, maxLength: 2 },
    { key: 'city', label: 'VILLE CIBLÉE', type: 'text', placeholder: 'EX: DAKAR' },
    { key: 'cost', label: 'FRAIS DE PORT (FCFA) *', type: 'number', min: 0 },
    { key: 'free_over', label: 'GRATUIT À PARTIR DE (FCFA)', type: 'number', min: 0, placeholder: 'Optionnel' },
    { key: 'estimated_days', label: 'DÉLAI ESTIMÉ DE LIVRAISON', type: 'text', placeholder: 'EX: 24 À 48H' },
    { key: 'position', label: 'ORDRE D\'AFFICHAGE', type: 'number', min: 0 },
  ];

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">LOGISTIQUE & EXPÉDITION</p>
          <h1 className="admin-page-title">ZONES DE LIVRAISON</h1>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreate}
        >
          AJOUTER UNE ZONE
        </button>
      </div>

      {/* ── Tableau des zones ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-spinner">
            <div className="admin-spinner-ring" />
          </div>
        ) : zones.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-label">AUCUNE ZONE DE LIVRAISON POUR LE MOMENT</p>
            <p className="admin-empty-desc">
              Configurez vos tarifs d'expédition par ville ou région pour le panier client.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ORDRE</th>
                <th>ZONE</th>
                <th>CODE</th>
                <th>VILLE / PAYS</th>
                <th>FRAIS DE PORT</th>
                <th>LIVRAISON GRATUITE DÈS</th>
                <th>DÉLAI ESTIMÉ</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <td style={{ color: '#8C8C8C', fontWeight: 700 }}>{z.position}</td>
                  <td style={{ fontWeight: 800, textTransform: 'uppercase' }}>{z.name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.1em' }}>
                      {z.code}
                    </span>
                  </td>
                  <td style={{ color: '#8C8C8C' }}>{z.city || z.country_code}</td>
                  <td style={{ fontWeight: 800 }}>{fmtFCFA(z.cost)}</td>
                  <td style={{ color: '#8C8C8C' }}>{z.free_over ? fmtFCFA(z.free_over) : 'NON SPÉCIFIÉ'}</td>
                  <td style={{ color: '#8C8C8C' }}>{z.estimated_days || '—'}</td>
                  <td>
                    <span
                      className={`admin-badge ${z.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleActive(z)}
                      title="Cliquer pour activer/désactiver"
                    >
                      {z.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '0.58rem' }}
                        onClick={() => openEdit(z)}
                      >
                        ÉDITER
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '8px 12px', fontSize: '0.58rem' }}
                        onClick={() => handleDelete(z)}
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

      {/* ── Modale Création / Édition Zone ── */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="admin-modal">
            <p className="admin-modal-eyebrow">
              {editing ? 'MODIFICATION ZONE' : 'NOUVELLE ZONE LOGISTIQUE'}
            </p>
            <h2 className="admin-modal-title">
              {editing ? editing.name : 'PARAMÉTRER LA LIVRAISON'}
            </h2>

            {error && <div className="admin-alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              {FIELDS.map(({ key, label, type, placeholder, ...rest }) => (
                <div key={key} className="admin-form-group">
                  <label className="admin-label">{label}</label>
                  <input
                    className="admin-input"
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    {...rest}
                  />
                </div>
              ))}

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="admin-checkbox-label">ZONE ACTIVE ET PROPOSÉE LORS DU TUNNEL DE COMMANDE</span>
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
                {saving ? 'ENREGISTREMENT…' : editing ? 'ENREGISTRER' : 'CRÉER LA ZONE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
