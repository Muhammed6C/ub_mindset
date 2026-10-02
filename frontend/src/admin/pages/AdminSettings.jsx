import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import '../admin.css';

const GROUPS = [
  {
    key: 'general',
    label: 'GÉNÉRAL',
    icon: '◈',
    fields: [
      { key: 'store_name',      label: 'NOM DE LA BOUTIQUE',       type: 'text',  hint: 'Affiché dans le titre, le header et les communications' },
      { key: 'contact_email',   label: 'EMAIL DE CONTACT PUBLIC',  type: 'email', hint: 'Email visible par les clients et pour les notifications' },
      { key: 'contact_phone',   label: 'TÉLÉPHONE DU SERVICE CLIENT', type: 'text', hint: 'Affiché dans le footer et sur les récapitulatifs' },
      { key: 'whatsapp_number', label: 'NUMÉRO WHATSAPP OFFICIEL', type: 'text',  hint: 'Avec indicatif international (ex: +221770000000)' },
      { key: 'address',         label: 'ADRESSE DU SHOWROOM / LOCAL', type: 'text', hint: 'Emplacement physique de la marque' },
      { key: 'default_currency',label: 'DEVISE DU SITE',           type: 'text',  hint: 'Symbole monétaire (ex: FCFA)' },
    ],
  },
  {
    key: 'shipping',
    label: 'LIVRAISON',
    icon: '⬡',
    fields: [
      { key: 'default_shipping_cost',    label: 'FRAIS DE PORT PAR DÉFAUT (FCFA)', type: 'number', hint: 'Tarif appliqué si aucune zone spécifique n\'est sélectionnée' },
      { key: 'free_shipping_threshold',  label: 'SEUIL LIVRAISON OFFERTE (FCFA)',  type: 'number', hint: 'Montant du panier déclenchant la livraison gratuite (0 pour désactiver)' },
      { key: 'estimated_delivery_delay', label: 'DÉLAI DE LIVRAISON ANNONCÉ',      type: 'text',   hint: 'Délai standard affiché (ex: 24 à 48 heures ouvrables)' },
    ],
  },
  {
    key: 'seo',
    label: 'RÉFÉRENCEMENT (SEO)',
    icon: '◉',
    fields: [
      { key: 'meta_title',       label: 'TITRE META PRINCIPAL (TITLE)', type: 'text',     hint: 'Titre apparaissant dans les résultats Google et l\'onglet' },
      { key: 'meta_description', label: 'DESCRIPTION META (SNIPPET)',  type: 'textarea', hint: 'Description percutante pour le moteur de recherche (150-160 caractères)' },
      { key: 'og_image_url',     label: 'IMAGE OPEN GRAPH (URL)',       type: 'url',      hint: 'Aperçu visuel affiché lors des partages sur WhatsApp, Instagram, Twitter' },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState('general');

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => {
        const map = {};
        (res.data.data || []).forEach((s) => {
          const v = s.value;
          map[s.key] = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
        });
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const group = GROUPS.find((g) => g.key === activeGroup);
    try {
      const payload = group.fields.map((f) => ({
        key: f.key,
        value: f.type === 'number' ? (parseFloat(settings[f.key]) || 0) : (settings[f.key] ?? ''),
        is_public: true,
      }));
      await api.post('/admin/settings', { settings: payload });
      setSuccess('RÉGLAGES ENREGISTRÉS AVEC SUCCÈS.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la sauvegarde des paramètres.');
    } finally {
      setSaving(false);
    }
  };

  const group = GROUPS.find((g) => g.key === activeGroup);

  return (
    <div className="admin-page">
      {/* ── Entête de page ── */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">PARAMÈTRES & CONFIGURATION</p>
          <h1 className="admin-page-title">RÉGLAGES DU SITE</h1>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'ENREGISTREMENT…' : 'SAUVEGARDER'}
        </button>
      </div>

      {success && <div className="admin-alert-success">✓ {success}</div>}
      {error && <div className="admin-alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Onglets de configuration */}
        <div className="admin-settings-tabs" style={{ minWidth: '200px' }}>
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              className={`admin-settings-tab${activeGroup === g.key ? ' active' : ''}`}
              onClick={() => setActiveGroup(g.key)}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        {/* Panneau de saisie */}
        <div className="admin-settings-panel" style={{ flex: 1, minWidth: '320px', maxWidth: '640px' }}>
          {loading ? (
            <div className="admin-spinner">
              <div className="admin-spinner-ring" />
            </div>
          ) : (
            <>
              <p style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#8C8C8C',
                marginBottom: 32
              }}>
                {group.icon} SECTION {group.label}
              </p>

              {group.fields.map((f) => (
                <div key={f.key} className="admin-form-group">
                  <label className="admin-label">{f.label}</label>
                  {f.hint && <p className="admin-hint">{f.hint}</p>}
                  {f.type === 'textarea' ? (
                    <textarea
                      className="admin-input"
                      rows={3}
                      value={settings[f.key] ?? ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="admin-input"
                      type={f.type}
                      min={f.type === 'number' ? 0 : undefined}
                      value={settings[f.key] ?? ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
