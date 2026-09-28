import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────
   UB MINDSET — COLLECTION V2
   · Grille éditoriale asymétrique (featured + grid)
   · Placeholders premium avec numérotation & teintes uniques
   · Hover : zoom + bouton "AJOUTER" flottant
   · Tags NOUVEAU / BEST-SELLER / ÉDITION LIMITÉE
   · Reveal au scroll via IntersectionObserver
   · Sélecteur de taille rapide au hover (desktop)
   · prefers-reduced-motion respecté
   ───────────────────────────────────────────────────────── */

const PRODUCTS = [
  {
    id: 1,
    name: 'HOODIE TECH',
    subtitle: 'Fleece 380g — Coupe oversize',
    price: '140 €',
    originalPrice: null,
    tag: 'BEST-SELLER',
    tagColor: '#0A0A0A',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    bg: ['#DDDCD8', '#D0CFCB'],
    accent: '#8C8C8C',
    featured: true, // grande carte éditoriale
    num: '01',
  },
  {
    id: 2,
    name: 'VESTE WIND BREAKER',
    subtitle: 'Ripstop imperméable — Zip YKK',
    price: '195 €',
    originalPrice: null,
    tag: 'NOUVEAU',
    tagColor: '#2A2A2A',
    sizes: ['S', 'M', 'L', 'XL'],
    bg: ['#E2E1DC', '#D8D7D2'],
    accent: '#6A6A6A',
    featured: false,
    num: '02',
  },
  {
    id: 3,
    name: 'LEGGING PERFORMANCE',
    subtitle: 'Compression 4-way stretch',
    price: '110 €',
    originalPrice: null,
    tag: null,
    tagColor: null,
    sizes: ['XS', 'S', 'M', 'L'],
    bg: ['#E8E7E2', '#DDDCD7'],
    accent: '#9C9C9C',
    featured: false,
    num: '03',
  },
  {
    id: 4,
    name: 'T-SHIRT ESSENTIAL',
    subtitle: 'Coton pima 220g — Col rond',
    price: '85 €',
    originalPrice: '110 €',
    tag: 'PROMO',
    tagColor: '#4A4A4A',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    bg: ['#E0DFDA', '#D6D5D0'],
    accent: '#7A7A7A',
    featured: false,
    num: '04',
  },
  {
    id: 5,
    name: 'SWEAT OVERSIZED',
    subtitle: 'French terry 300g — Col montant',
    price: '120 €',
    originalPrice: null,
    tag: null,
    tagColor: null,
    sizes: ['S', 'M', 'L', 'XL'],
    bg: ['#DCDBD6', '#D2D1CC'],
    accent: '#8A8A8A',
    featured: false,
    num: '05',
  },
  {
    id: 6,
    name: 'SHORT TRAINING',
    subtitle: 'Dry-fit — Poche zippée',
    price: '75 €',
    originalPrice: null,
    tag: 'ÉDITION LTD.',
    tagColor: '#3A3A3A',
    sizes: ['S', 'M', 'L', 'XL'],
    bg: ['#E6E5E0', '#DCDBD6'],
    accent: '#7C7C7C',
    featured: false,
    num: '06',
  },
];

/* ── Icône SVG minimaliste par produit ── */
function ProductSilhouette({ id, accent }) {
  const s = { fill: 'none', stroke: accent, strokeWidth: '0.8', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 1: // hoodie
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M16 4c2.5 0 4.5 2 4.5 4l4 4-3 3-1-1v13H11V14l-1 1-3-3 4-4c0-2 2-4 4.5-4z" />
          <path d="M13 4.5a4.5 4.5 0 0 0 6 0" />
          <path d="M11 14h10" />
        </svg>
      );
    case 2: // veste
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M11 4L4 9l3 3 1-1v16h16V11l1 1 3-3-7-5-2 1.5a5 5 0 0 1-8 0L11 4z" />
          <line x1="16" y1="9" x2="16" y2="28" />
          <path d="M13 13h6" />
        </svg>
      );
    case 3: // legging
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M10 4h12l2 24H18l-2-14-2 14H8L10 4z" />
          <path d="M8 10h16" />
        </svg>
      );
    case 4: // tshirt
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M9 4L3 9l3 3 2-1v16h16V11l2 1 3-3-6-5-2 1.5a6 6 0 0 1-11 0L9 4z" />
        </svg>
      );
    case 5: // sweat
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M10 5L3 10l3 3 2-1v16h16V12l2 1 3-3-7-5-2 1.5a6 6 0 0 1-10 0L10 5z" />
          <path d="M10 19h12" />
          <path d="M13 5c0 2.5 6 2.5 6 0" />
        </svg>
      );
    case 6: // short
      return (
        <svg width="90" height="90" viewBox="0 0 32 32" {...s}>
          <path d="M7 6h18l1 12H22l-6-4-6 4H7L7 6z" />
          <path d="M7 18l3 8h4l2-6 2 6h4l3-8" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Carte produit individuelle ── */
function ProductCard({ product, visible, delay, featured }) {
  const [hoveredSize, setHoveredSize] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    if (!selectedSize && !featured) return;
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }, [selectedSize, featured]);

  return (
    <Link
      to={`/product/${product.id}`}
      className={`cv2-card ${featured ? 'cv2-card--featured' : ''} ${visible ? 'cv2-card--in' : ''}`}
      style={{ '--delay': `${delay}ms` }}
      aria-label={`${product.name} — ${product.price}`}
    >
      {/* Zone image */}
      <div className="cv2-card-img" style={{ background: `linear-gradient(145deg, ${product.bg[0]} 0%, ${product.bg[1]} 100%)` }}>

        {/* Numérotation éditoriale */}
        <span className="cv2-card-num" aria-hidden="true">{product.num}</span>

        {/* Silhouette produit */}
        <div className="cv2-card-silhouette">
          <ProductSilhouette id={product.id} accent={product.accent} />
        </div>

        {/* Tag (NOUVEAU, BEST-SELLER…) */}
        {product.tag && (
          <span className="cv2-card-tag" style={{ background: product.tagColor }}>
            {product.tag}
          </span>
        )}

        {/* Overlay hover — sélecteur taille + CTA */}
        <div className="cv2-card-overlay" role="group" aria-label="Sélection rapide">
          <div className="cv2-size-row" onClick={e => e.preventDefault()}>
            {product.sizes.map(sz => (
              <button
                key={sz}
                className={`cv2-size-btn ${selectedSize === sz ? 'cv2-size-btn--active' : ''} ${hoveredSize === sz ? 'cv2-size-btn--hover' : ''}`}
                onMouseEnter={() => setHoveredSize(sz)}
                onMouseLeave={() => setHoveredSize(null)}
                onClick={(e) => { e.preventDefault(); setSelectedSize(sz); }}
                aria-label={`Taille ${sz}`}
                aria-pressed={selectedSize === sz}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            className={`cv2-add-btn ${addedFeedback ? 'cv2-add-btn--added' : ''} ${!selectedSize && !featured ? 'cv2-add-btn--disabled' : ''}`}
            onClick={handleAddToCart}
            aria-label={addedFeedback ? 'Ajouté au panier' : 'Ajouter au panier'}
          >
            {addedFeedback ? '✓ AJOUTÉ' : selectedSize ? `AJOUTER — ${selectedSize}` : 'CHOISIR UNE TAILLE'}
          </button>
        </div>
      </div>

      {/* Infos produit */}
      <div className="cv2-card-info">
        <div className="cv2-card-info-top">
          <h3 className="cv2-card-name">{product.name}</h3>
          <div className="cv2-card-prices">
            {product.originalPrice && (
              <span className="cv2-card-original-price">{product.originalPrice}</span>
            )}
            <span className={`cv2-card-price ${product.originalPrice ? 'cv2-card-price--sale' : ''}`}>
              {product.price}
            </span>
          </div>
        </div>
        <p className="cv2-card-subtitle">{product.subtitle}</p>
        <div className="cv2-card-sizes-hint" aria-hidden="true">
          {product.sizes.join(' · ')}
        </div>
      </div>
    </Link>
  );
}

/* ── Section principale ── */
export default function Collection() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRefs = useRef([]);

  const featured = PRODUCTS.find(p => p.featured);
  const grid     = PRODUCTS.filter(p => !p.featured);

  /* IntersectionObserver — header */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* IntersectionObserver — cards */
  useEffect(() => {
    const observers = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set([...prev, i]));
            obs.disconnect();
          }
        },
        { threshold: 0.12 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="collection"
      className="cv2-section"
      aria-label="Collection Automne-Hiver 2026"
    >

      {/* ══════════════════════════════════════════
          EN-TÊTE ÉDITORIAL ASYMÉTRIQUE
          ══════════════════════════════════════════ */}
      <div
        ref={headerRef}
        className={`cv2-header ${headerVisible ? 'cv2-header--in' : ''}`}
      >
        <div className="cv2-header-left">
          <p className="cv2-header-label">
            Collection AH — 2026 &nbsp;·&nbsp; Édition limitée
          </p>
          <h2 className="cv2-header-title">
            <span className="cv2-header-line1">CONÇU POUR</span>
            <span className="cv2-header-line2">PERFORMER.</span>
          </h2>
          <div className="cv2-header-divider" />
        </div>

        <div className="cv2-header-right">
          <p className="cv2-header-desc">
            Des pièces pensées pour l'effort, la rue et le podium.
            Chaque couture, chaque matière a été choisie pour ceux
            qui refusent de choisir entre style et performance.
          </p>
          <div className="cv2-header-stats">
            <div className="cv2-stat">
              <span className="cv2-stat-num">6</span>
              <span className="cv2-stat-label">Pièces</span>
            </div>
            <div className="cv2-stat-sep" />
            <div className="cv2-stat">
              <span className="cv2-stat-num">50</span>
              <span className="cv2-stat-label">Exemplaires</span>
            </div>
            <div className="cv2-stat-sep" />
            <div className="cv2-stat">
              <span className="cv2-stat-num">AH</span>
              <span className="cv2-stat-label">2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PRODUIT FEATURED (grande carte éditoriale)
          ══════════════════════════════════════════ */}
      <div className="cv2-featured-wrap">
        <div
          ref={el => { cardRefs.current[0] = el; }}
          className="cv2-featured-inner"
        >
          <ProductCard
            product={featured}
            visible={visibleCards.has(0)}
            delay={0}
            featured
          />
        </div>

        {/* Texte éditorial à côté du featured */}
        <div className={`cv2-featured-aside ${visibleCards.has(0) ? 'cv2-featured-aside--in' : ''}`}>
          <p className="cv2-featured-aside-label">PIÈCE SIGNATURE</p>
          <p className="cv2-featured-aside-copy">
            Notre best-seller depuis le lancement. Le Hoodie Tech
            allie chaleur et liberté de mouvement grâce à son fleece
            380g et sa coupe oversize pensée pour le mouvement.
          </p>
          <div className="cv2-featured-aside-note">
            <span>★★★★★</span>
            <span className="cv2-featured-aside-reviews">48 avis · 4.9 / 5</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          GRILLE 5 PRODUITS
          ══════════════════════════════════════════ */}
      <div className="cv2-grid">
        {grid.map((product, i) => (
          <div
            key={product.id}
            ref={el => { cardRefs.current[i + 1] = el; }}
          >
            <ProductCard
              product={product}
              visible={visibleCards.has(i + 1)}
              delay={i * 80}
              featured={false}
            />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          FOOTER DE SECTION
          ══════════════════════════════════════════ */}
      <div className="cv2-footer">
        <div className="cv2-footer-left">
          <p className="cv2-footer-note">
            Livraison offerte dès 150&nbsp;€ · Dakar & Paris
          </p>
        </div>
        <Link to="/catalog" className="cv2-cta">
          <span>VOIR TOUTE LA COLLECTION</span>
          <svg width="18" height="7" viewBox="0 0 18 7" fill="none" aria-hidden="true">
            <path d="M0 3.5H16M13 1L16.5 3.5L13 6" stroke="currentColor" strokeWidth="0.9"/>
          </svg>
        </Link>
      </div>

      {/* ── STYLES ── */}
      <style>{`

        /* ════════════════════════════════════════
           SECTION
           ════════════════════════════════════════ */
        .cv2-section {
          background: #F2F1EF;
          padding: 100px 0 120px;
          position: relative;
          overflow: hidden;
        }

        /* ════════════════════════════════════════
           EN-TÊTE
           ════════════════════════════════════════ */
        .cv2-header {
          max-width: 1400px;
          margin: 0 auto 80px;
          padding: 0 48px;
          display: flex;
          align-items: flex-end;
          gap: 60px;
        }

        .cv2-header-left {
          flex-shrink: 0;
        }

        .cv2-header-label {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          color: #8C8C8C;
          margin-bottom: 18px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .cv2-header--in .cv2-header-label {
          opacity: 1; transform: translateY(0);
          transition-delay: 0.05s;
        }

        .cv2-header-title {
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 0.93;
          letter-spacing: -0.02em;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
        }

        .cv2-header-line1 {
          font-size: clamp(2.6rem, 4.5vw, 4.8rem);
          color: #0A0A0A;
          display: block;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s,
                      transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s;
        }
        .cv2-header-line2 {
          font-size: clamp(2.6rem, 4.5vw, 4.8rem);
          color: #5A5A5A;
          display: block;
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s,
                      transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s;
        }
        .cv2-header--in .cv2-header-line1,
        .cv2-header--in .cv2-header-line2 {
          opacity: 1; transform: translateY(0);
        }

        .cv2-header-divider {
          width: 0;
          height: 2px;
          background: #0A0A0A;
          transition: width 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s;
        }
        .cv2-header--in .cv2-header-divider { width: 48px; }

        .cv2-header-right {
          padding-bottom: 4px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s;
        }
        .cv2-header--in .cv2-header-right { opacity: 1; transform: translateY(0); }

        .cv2-header-desc {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.82rem;
          line-height: 1.75;
          color: #6B6B6B;
          max-width: 400px;
          margin-bottom: 28px;
        }

        .cv2-header-stats {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cv2-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .cv2-stat-num {
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          font-size: 1.4rem;
          color: #0A0A0A;
          line-height: 1;
        }
        .cv2-stat-label {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.45rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #8C8C8C;
          margin-top: 3px;
        }
        .cv2-stat-sep {
          width: 1px;
          height: 32px;
          background: #D9D8D5;
        }

        /* ════════════════════════════════════════
           CARTE PRODUIT
           ════════════════════════════════════════ */
        .cv2-card {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.6s cubic-bezier(0.16,1,0.3,1) var(--delay, 0ms),
            transform 0.6s cubic-bezier(0.16,1,0.3,1) var(--delay, 0ms);
        }
        .cv2-card--in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Zone image */
        .cv2-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          transition: box-shadow 0.4s ease;
        }
        .cv2-card:hover .cv2-card-img {
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        /* Numéro éditorial */
        .cv2-card-num {
          position: absolute;
          top: 16px;
          left: 18px;
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          color: rgba(10,10,10,0.18);
          z-index: 1;
          user-select: none;
        }

        /* Silhouette */
        .cv2-card-silhouette {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s cubic-bezier(0.22,1,0.36,1),
                      opacity 0.4s ease;
        }
        .cv2-card:hover .cv2-card-silhouette {
          transform: scale(1.06) translateY(-6px);
          opacity: 0.6;
        }

        /* Tag */
        .cv2-card-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.38rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #F2F1EF;
          padding: 4px 8px;
          border-radius: 1px;
          z-index: 2;
        }

        /* Overlay au hover */
        .cv2-card-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px;
          background: linear-gradient(to top, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.18) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: 3;
        }
        .cv2-card:hover .cv2-card-overlay { opacity: 1; }

        /* Rangée de tailles */
        .cv2-size-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          transform: translateY(8px);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .cv2-card:hover .cv2-size-row { transform: translateY(0); }

        .cv2-size-btn {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.45rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(242,241,239,0.7);
          background: rgba(242,241,239,0.12);
          border: 1px solid rgba(242,241,239,0.25);
          border-radius: 1px;
          padding: 5px 8px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .cv2-size-btn--hover,
        .cv2-size-btn:hover {
          background: rgba(242,241,239,0.22);
          color: #F2F1EF;
          border-color: rgba(242,241,239,0.55);
        }
        .cv2-size-btn--active {
          background: #F2F1EF;
          color: #0A0A0A;
          border-color: #F2F1EF;
        }

        /* Bouton ajouter */
        .cv2-add-btn {
          width: 100%;
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.52rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #0A0A0A;
          background: #F2F1EF;
          border: none;
          border-radius: 1px;
          padding: 11px 16px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
          transform: translateY(8px);
        }
        .cv2-card:hover .cv2-add-btn { transform: translateY(0); }
        .cv2-add-btn:hover { background: #FFFFFF; }
        .cv2-add-btn:active { transform: scale(0.97); }
        .cv2-add-btn--added {
          background: #0A0A0A;
          color: #F2F1EF;
        }
        .cv2-add-btn--disabled {
          opacity: 0.7;
          cursor: default;
        }

        /* Infos sous la carte */
        .cv2-card-info {
          padding: 16px 0 0;
        }
        .cv2-card-info-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 5px;
        }
        .cv2-card-name {
          font-family: "Archivo", sans-serif;
          font-weight: 800;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #0A0A0A;
          margin: 0;
          flex: 1;
          transition: letter-spacing 0.3s ease;
        }
        .cv2-card:hover .cv2-card-name {
          letter-spacing: 0.18em;
        }
        .cv2-card-prices {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }
        .cv2-card-price {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: #0A0A0A;
        }
        .cv2-card-price--sale { color: #3A3A3A; }
        .cv2-card-original-price {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.62rem;
          color: #B0B0B0;
          text-decoration: line-through;
        }
        .cv2-card-subtitle {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.58rem;
          color: #8C8C8C;
          margin: 0 0 8px;
          letter-spacing: 0.05em;
        }
        .cv2-card-sizes-hint {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.42rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #C4C3C0;
        }

        /* ════════════════════════════════════════
           CARTE FEATURED (grande)
           ════════════════════════════════════════ */
        .cv2-featured-wrap {
          max-width: 1400px;
          margin: 0 auto 72px;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
        }

        .cv2-card--featured .cv2-card-img {
          aspect-ratio: 16 / 9;
        }
        .cv2-card--featured .cv2-card-silhouette svg {
          width: 140px;
          height: 140px;
        }
        .cv2-card--featured .cv2-card-name {
          font-size: 1rem;
        }
        .cv2-card--featured .cv2-card-price {
          font-size: 1rem;
        }

        /* Texte éditorial aside */
        .cv2-featured-aside {
          opacity: 0;
          transform: translateX(16px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          padding: 20px 0;
        }
        .cv2-featured-aside--in {
          opacity: 1;
          transform: translateX(0);
        }
        .cv2-featured-aside-label {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.48rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          color: #8C8C8C;
        }
        .cv2-featured-aside-copy {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.82rem;
          line-height: 1.75;
          color: #4A4A4A;
        }
        .cv2-featured-aside-note {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.7rem;
          color: #0A0A0A;
        }
        .cv2-featured-aside-reviews {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.48rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #8C8C8C;
        }

        /* ════════════════════════════════════════
           GRILLE 5 PRODUITS
           ════════════════════════════════════════ */
        .cv2-grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 56px 32px;
        }

        /* ════════════════════════════════════════
           FOOTER DE SECTION
           ════════════════════════════════════════ */
        .cv2-footer {
          max-width: 1400px;
          margin: 80px auto 0;
          padding: 0 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #E8E7E3;
          padding-top: 40px;
        }

        .cv2-footer-note {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.52rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #8C8C8C;
        }

        .cv2-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          color: #F2F1EF;
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 16px 28px;
          background: #0A0A0A;
          border-radius: 2px;
          border: none;
          flex-shrink: 0;
          transition: background 0.25s ease, gap 0.3s ease, transform 0.2s ease;
        }
        .cv2-cta:hover {
          background: #2A2A2A;
          gap: 22px;
          transform: translateY(-2px);
        }
        .cv2-cta:active { transform: scale(0.97); }

        /* ════════════════════════════════════════
           TABLETTE — 769 à 1024px
           ════════════════════════════════════════ */
        @media (min-width: 769px) and (max-width: 1024px) {
          .cv2-header { flex-direction: column; align-items: flex-start; gap: 32px; padding: 0 36px; }
          .cv2-featured-wrap { padding: 0 36px; grid-template-columns: 1fr 260px; align-items: center; }
          .cv2-card--featured .cv2-card-img { aspect-ratio: 3 / 2; }
          .cv2-grid { grid-template-columns: repeat(2, 1fr); gap: 44px 24px; padding: 0 36px; }
          .cv2-footer { padding: 40px 36px 0; flex-direction: column; align-items: flex-start; gap: 24px; }
          .cv2-cta { width: 100%; justify-content: center; }
        }

        /* ════════════════════════════════════════
           DESKTOP ≥1025px — featured en 2 colonnes
           ════════════════════════════════════════ */
        @media (min-width: 1025px) {
          .cv2-featured-wrap {
            grid-template-columns: 1fr 300px;
            align-items: center;
            gap: 56px;
          }
          .cv2-card--featured .cv2-card-img { aspect-ratio: 3 / 2; }
        }

        /* ════════════════════════════════════════
           MOBILE — ≤768px
           ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .cv2-section { padding: 72px 0 90px; }
          .cv2-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 28px;
            padding: 0 20px;
            margin-bottom: 52px;
          }
          .cv2-header-line1, .cv2-header-line2 {
            font-size: clamp(2.2rem, 9vw, 3rem);
          }
          .cv2-header-right { max-width: 100%; }
          .cv2-header-desc { font-size: 0.78rem; }
          .cv2-featured-wrap { padding: 0 20px; gap: 24px; }
          .cv2-card--featured .cv2-card-img { aspect-ratio: 4 / 3; }
          .cv2-card--featured .cv2-card-silhouette svg { width: 110px; height: 110px; }
          .cv2-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 36px 16px;
            padding: 0 20px;
          }
          .cv2-footer { padding: 36px 20px 0; flex-direction: column; gap: 20px; }
          .cv2-footer-note { display: none; }
          .cv2-cta { width: 100%; justify-content: center; font-size: 0.62rem; }
        }

        @media (max-width: 420px) {
          .cv2-grid { grid-template-columns: 1fr; gap: 44px; }
        }

        /* ════════════════════════════════════════
           REDUCED MOTION
           ════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .cv2-card,
          .cv2-header-label,
          .cv2-header-line1,
          .cv2-header-line2,
          .cv2-header-right,
          .cv2-featured-aside {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .cv2-header-divider { transition: none !important; width: 48px !important; }
          .cv2-card-silhouette,
          .cv2-card-overlay,
          .cv2-size-row,
          .cv2-add-btn,
          .cv2-card-name { transition: none !important; }
        }

      `}</style>
    </section>
  );
}
