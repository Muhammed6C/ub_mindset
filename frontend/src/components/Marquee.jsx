import React from 'react';

const ITEMS = [
  'COLLECTION AUTOMNE–HIVER 2026',
  'LIVRAISON DAKAR · PARIS',
  'DISCIPLINE · FOCUS · PROGRESSION',
  'PAIEMENT WAVE & ORANGE MONEY',
  'ÉDITION LIMITÉE',
  'QUALITÉ PREMIUM',
  'BUILT THROUGH PAIN',
];

export default function Marquee() {
  /* Duplique la liste pour une boucle fluide sans coupure */
  const loop = [...ITEMS, ...ITEMS];

  return (
    <section
      className="marquee-section"
      style={{
        background: '#0A0A0A',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span className="marquee-item" key={i}>
            <span className="marquee-text" style={{ color: '#F2F1EF' }}>{item}</span>
            <span className="marquee-star" style={{ color: '#8C8C8C' }}>✦</span>
          </span>
        ))}
      </div>

      <style>{`
        .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          flex-shrink: 0;
          animation: marqueeScroll 30s linear infinite;
          will-change: transform;
        }

        .marquee-item {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          padding: 0 18px;
        }

        .marquee-text {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: '0.75rem';
          text-transform: uppercase;
          letter-spacing: '0.3em';
          color: '#F2F1EF';
          white-space: nowrap;
          padding: '0 36px';
        }

        .marquee-star {
          font-size: '0.55rem';
          color: '#8C8C8C';
          flex-shrink: 0;
        }

        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Pause au survol (desktop) */
        .marquee-section:hover .marquee-track {
          animation-play-state: paused;
        }

        /* Mobile — hauteur et taille réduites */
        @media (max-width: 768px) {
          .marquee-section {
            height: '46px' !important;
          }
          .marquee-text {
            font-size: '0.6rem' !important;
            letter-spacing: '0.25em' !important;
            padding: '0 24px' !important;
          }
          .marquee-star {
            font-size: '0.45rem' !important;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
