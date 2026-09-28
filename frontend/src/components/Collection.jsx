import React from 'react';
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 1, name: 'T-SHIRT ESSENTIAL', price: '85 €', icon: 'tshirt' },
  { id: 2, name: 'LEGGING PERFORMANCE', price: '110 €', icon: 'pants' },
  { id: 3, name: 'VESTE WIND BREAKER', price: '195 €', icon: 'jacket' },
  { id: 4, name: 'SWEAT OVERSIZED', price: '120 €', icon: 'sweat' },
  { id: 5, name: 'SHORT TRAINING', price: '75 €', icon: 'shorts' },
  { id: 6, name: 'HOODIE TECH', price: '140 €', icon: 'hoodie' },
];

function ProductIcon({ type }) {
  const common = {
    fill: 'none',
    stroke: '#8C8C8C',
    strokeWidth: '1.2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (type) {
    case 'tshirt':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M6 3l-4 4 2 2 2-1v12h12V8l2 1 2-2-4-4-2 1a4 4 0 0 1-8 0l-2-1z"/>
        </svg>
      );
    case 'pants':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M6 3h12l1 18h-5l-2-12-2 12H5L6 3z"/>
        </svg>
      );
    case 'jacket':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M8 3L3 7l2 2 1-1v13h12V8l1 1 2-2-5-4-2 1a5 5 0 0 1-6 0L8 3z"/>
          <line x1="12" y1="7" x2="12" y2="21"/>
        </svg>
      );
    case 'sweat':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M7 4l-4 4 2 2 2-1v11h10V9l2 1 2-2-4-4a5 5 0 0 0-10 0z"/>
        </svg>
      );
    case 'shorts':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M5 4h14l1 16h-6l-2-10-2 10H4L5 4z"/>
        </svg>
      );
    case 'hoodie':
      return (
        <svg width="72" height="72" viewBox="0 0 24 24" {...common}>
          <path d="M12 3a4 4 0 0 1 4 4l3 3-2 2-1-1v10H8V11l-1 1-2-2 3-3a4 4 0 0 1 4-4z"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function Collection() {
  return (
    <section
      id="collection"
      className="collection-section"
      style={{
        background: '#F2F1EF',
        padding: '100px 28px 120px',
        position: 'relative',
      }}
    >
      {/* ── EN-TÊTE DE SECTION ── */}
      <div
        className="collection-header"
        style={{
          maxWidth: '1400px',
          margin: '0 auto 80px',
          textAlign: 'center',
        }}
      >
        {/* Label */}
        <p
          className="collection-label"
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontWeight: 500,
            fontSize: '0.55rem',
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            color: '#8C8C8C',
            marginBottom: '16px',
          }}
        >
          NOTRE SÉLECTION
        </p>

        {/* Titre */}
        <h2
          className="collection-title"
          style={{
            fontFamily: '"Archivo", sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: '1.05',
            letterSpacing: '-0.01em',
            color: '#0A0A0A',
            margin: '0 0 20px',
          }}
        >
          Conçu pour performer
        </h2>

        {/* Séparateur fin */}
        <div
          className="collection-separator"
          style={{
            width: '32px',
            height: '2px',
            background: '#0A0A0A',
            margin: '0 auto 20px',
          }}
        />

        {/* Sous-texte */}
        <p
          className="collection-subtitle"
          style={{
            fontFamily: '"Archivo Narrow", sans-serif',
            fontSize: '0.85rem',
            lineHeight: '1.7',
            color: '#6B6B6B',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          Des pièces essentielles, pensées pour durer et conçues pour vous
          accompagner dans chaque effort.
        </p>
      </div>

      {/* ── GRILLE DE PRODUITS ── */}
      <div
        className="collection-grid"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '48px 32px',
        }}
      >
        {PRODUCTS.map((product, i) => (
          <div
            key={product.id}
            className={`collection-card anim-fade-in-up anim-delay-${(i % 3) * 200 + 200}`}
            style={{
              cursor: 'pointer',
            }}
          >
            {/* Image placeholder */}
            <div
              className="collection-card-img"
              style={{
                width: '100%',
                aspectRatio: '4 / 5',
                background: 'linear-gradient(155deg, #E8E7E3 0%, #DDDDD9 50%, #D5D4D0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="collection-card-icon"
              >
                <ProductIcon type={product.icon} />
              </div>
            </div>

            {/* Infos produit */}
            <div style={{ padding: '20px 0 0' }}>
              <h3
                className="collection-card-name"
                style={{
                  fontFamily: '"Archivo", sans-serif',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#0A0A0A',
                  margin: '0 0 6px',
                }}
              >
                {product.name}
              </h3>
              <p
                className="collection-card-price"
                style={{
                  fontFamily: '"Archivo Narrow", sans-serif',
                  fontSize: '0.75rem',
                  color: '#8C8C8C',
                  letterSpacing: '0.1em',
                  margin: 0,
                }}
              >
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOUTON CTA ── */}
      <div
        className="collection-cta-wrap"
        style={{
          maxWidth: '1400px',
          margin: '80px auto 0',
          textAlign: 'center',
        }}
      >
        <Link to="/catalog" className="collection-cta">
          <span className="collection-cta-text">VOIR TOUTE LA COLLECTION</span>
          <svg width="20" height="8" viewBox="0 0 18 7" fill="none" className="collection-cta-arrow">
            <path d="M0 3.5H16M13 1L16.5 3.5L13 6" stroke="#FFFFFF" strokeWidth="0.85"/>
          </svg>
        </Link>
      </div>

      <style>{`
        .collection-section {
          overflow: hidden;
        }

        .collection-card {
          position: relative;
        }

        .collection-card-img {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.35s ease;
        }

        .collection-card:hover .collection-card-img {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.10);
        }

        .collection-card:hover .collection-card-icon {
          transform: scale(1.08);
        }

        .collection-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 18px 36px;
          background: #000000;
          border: none;
          border-radius: 2px;
          text-decoration: none;
          transition: background 0.3s ease, gap 0.3s ease, transform 0.2s ease;
        }

        .collection-cta:hover {
          background: #2A2A2A;
          gap: 22px;
          transform: translateY(-2px);
        }

        .collection-cta-text {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #FFFFFF;
        }

        .collection-cta-arrow {
          transition: transform 0.3s ease;
        }

        .collection-cta:hover .collection-cta-arrow {
          transform: translateX(4px);
        }

        /* Tablette — 2 colonnes */
        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 40px 24px !important;
          }
        }

        /* Mobile — 1 colonne */
        @media (max-width: 768px) {
          .collection-section {
            padding: 70px 20px 90px !important;
          }
          .collection-header {
            margin-bottom: 50px !important;
          }
          .collection-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .collection-card-img {
            aspect-ratio: 4 / 3.8 !important;
          }
          .collection-cta-wrap {
            margin-top: 56px !important;
          }
          .collection-cta {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px 24px !important;
            font-size: 0.8rem !important;
          }
          .collection-cta-text {
            font-size: 0.8rem !important;
            letter-spacing: 0.2em !important;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .collection-card-img,
          .collection-card-icon,
          .collection-cta {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
