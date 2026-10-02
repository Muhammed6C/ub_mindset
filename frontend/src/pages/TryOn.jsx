import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  TRY_ON_CONFIG,
  TRY_ON_PRODUCT_CONFIG,
  buildWhatsAppUrl,
  getRecommendedSize,
} from '../config/tryOn';
import { AVATAR_CONFIG } from '../avatar3d/avatarConfig';
import { computeBodyProfile } from '../avatar3d/bodyProfile';
import AvatarViewer from '../components/AvatarViewer';
import './TryOn.css';

function ProductFallback({ label }) {
  return <span className="try-on__product-fallback">{label.slice(0, 2)}</span>;
}

export default function TryOn() {
  const { cart } = useCart();
  const [height, setHeight] = useState(TRY_ON_CONFIG.measurements.height.defaultValue);
  const [weight, setWeight] = useState(TRY_ON_CONFIG.measurements.weight.defaultValue);
  const [morphology, setMorphology] = useState('athletique');
  const [failedAssets, setFailedAssets] = useState({});
  const [items, setItems] = useState(() => cart
    .filter((item) => TRY_ON_PRODUCT_CONFIG[item.product.id])
    .map((item) => ({
      ...item,
      enabled: true,
      selectedSize: item.variant?.size || item.product.sizes?.[0] || null,
    })));

  const profile = useMemo(
    () => computeBodyProfile({ heightCm: height, weightKg: weight, morphology }),
    [height, weight, morphology],
  );

  const activeItems = items.filter((item) => item.enabled);

  const updateItem = (key, changes) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  };

  const handleWhatsApp = () => {
    if (activeItems.length) window.open(buildWhatsAppUrl(activeItems), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="try-on">
      <header className="try-on__header">
        <Link className="try-on__back" to="/#collection">← COLLECTION</Link>
        <div>
          <p className="try-on__eyebrow">UB MINDSET — STUDIO FIT</p>
          <h1>ESSAYER MES VÊTEMENTS</h1>
        </div>
      </header>

      {!items.length ? (
        <section className="try-on__empty">
          <p className="try-on__eyebrow">AUCUNE PIÈCE SÉLECTIONNÉE</p>
          <h2>Choisissez une pièce de la collection pour commencer.</h2>
          <Link className="try-on__primary-link" to="/#collection">VOIR LA COLLECTION</Link>
        </section>
      ) : (
        <div className="try-on__layout">
          <section className="try-on__controls" aria-label="Votre profil d'essayage">
            {Object.entries(TRY_ON_CONFIG.measurements).map(([name, config]) => {
              const value = name === 'height' ? height : weight;
              const setValue = name === 'height' ? setHeight : setWeight;
              const label = name === 'height' ? 'TAILLE' : 'POIDS';
              return (
                <label className="try-on__slider" key={name}>
                  <span>{label}<strong>{value} {config.unit}</strong></span>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(event) => setValue(Number(event.target.value))}
                    aria-label={label}
                  />
                  <small>{config.min} — {config.max} {config.unit}</small>
                </label>
              );
            })}

            <p className="try-on__eyebrow">MORPHOLOGIE</p>
            <div className="try-on__morphologies" role="group" aria-label="Morphologie déclarée">
              {Object.entries(AVATAR_CONFIG.morphology).map(([key, morph]) => (
                <button
                  key={key}
                  type="button"
                  className={morphology === key ? 'is-active' : ''}
                  aria-pressed={morphology === key}
                  onClick={() => setMorphology(key)}
                >
                  {morph.label}
                </button>
              ))}
            </div>

            {profile.warnings.length > 0 && (
              <p className="try-on__warning" role="status">{profile.warnings.join(' ')}</p>
            )}
          </section>

          <section className="try-on__stage" aria-label="Aperçu de l'avatar 3D">
            <AvatarViewer profile={profile} />
          </section>

          <section className="try-on__pieces" aria-label="Vos vêtements">
            <p className="try-on__eyebrow">VOS PIÈCES</p>
            {items.map((item) => {
              const suggested = getRecommendedSize(item.product, height, weight);
              return (
                <article className={`try-on__piece ${item.enabled ? 'is-enabled' : ''}`} key={item.key}>
                  <button className="try-on__thumbnail" type="button" onClick={() => updateItem(item.key, { enabled: !item.enabled })} aria-pressed={item.enabled} aria-label={`${item.enabled ? 'Retirer' : 'Ajouter'} ${item.product.name}`}>
                    {failedAssets[item.key] || !item.product.image ? <ProductFallback label={item.product.name} /> : <img src={item.product.image} alt="" onError={() => setFailedAssets((current) => ({ ...current, [item.key]: true }))} />}
                  </button>
                  <div className="try-on__piece-details">
                    <h2>{item.product.name}</h2>
                    <p>Conseillée : <strong>{suggested || '—'}</strong></p>
                    <div className="try-on__sizes" aria-label={`Taille de ${item.product.name}`}>
                      {(item.product.sizes || []).map((size) => <button key={size} className={item.selectedSize === size ? 'is-active' : ''} type="button" onClick={() => updateItem(item.key, { selectedSize: size })}>{size}</button>)}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      )}

      {items.length > 0 && <footer className="try-on__order-bar">
        <p><strong>{activeItems.length}</strong> ARTICLE{activeItems.length > 1 ? 'S' : ''}<span>{activeItems.map((item) => item.selectedSize).filter(Boolean).join(' · ')}</span></p>
        <button type="button" disabled={!activeItems.length} onClick={handleWhatsApp}>COMMANDER SUR WHATSAPP</button>
      </footer>}
    </main>
  );
}
