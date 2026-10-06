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
  const renderItems = (group) => ITEMS.map((item) => (
    <span className="marquee-item" key={`${group}-${item}`}>
      <span className="marquee-text">{item}</span>
      <img className="marquee-logo" src="/only-ub-optimized.webp" alt="" aria-hidden="true" />
    </span>
  ));

  return (
    <section
      className="marquee-section"
      style={{
        background: '#0A0A0A',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        <div className="marquee-group">{renderItems('first')}</div>
        <div className="marquee-group" aria-hidden="true">{renderItems('second')}</div>
      </div>

      <style>{`
        .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          flex-shrink: 0;
          animation: marqueeScroll 34s linear infinite;
          will-change: transform;
        }

        .marquee-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .marquee-item {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 24px;
          padding: 0 24px;
        }

        .marquee-text {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #FFFFF0;
          white-space: nowrap;
        }

        .marquee-logo {
          width: 22px;
          height: 22px;
          object-fit: contain;
          filter: invert(1) brightness(1.4);
          opacity: 0.82;
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
            height: 50px !important;
          }
          .marquee-text {
            font-size: 0.6rem !important;
            letter-spacing: 0.16em !important;
          }
          .marquee-item {
            gap: 18px;
            padding: 0 18px;
          }
          .marquee-logo {
            width: 18px;
            height: 18px;
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
