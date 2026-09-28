import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   UB MINDSET — HERO V2
   · Image WebP responsive (srcset)
   · Layout split desktop / overlay mobile
   · Titre impactant + CTA double
   · Barre de confiance (trust bar)
   · Parallax léger sur desktop
   · prefers-reduced-motion respecté
   ───────────────────────────────────────────── */

const TRUST_ITEMS = [
  { icon: '⚡', label: 'LIVRAISON DAKAR · PARIS' },
  { icon: '✦',  label: 'ÉDITION LIMITÉE — 50 PIÈCES' },
  { icon: '↩',  label: 'RETOURS GRATUITS 14J' },
];

export default function Hero() {
  const imgRef      = useRef(null);
  const sectionRef  = useRef(null);
  const [entered, setEntered] = useState(false);
  const [trustIdx, setTrustIdx] = useState(0);

  /* ── Entrée différée pour déclencher les transitions CSS ── */
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Rotation automatique de la trust bar ── */
  useEffect(() => {
    const id = setInterval(
      () => setTrustIdx(i => (i + 1) % TRUST_ITEMS.length),
      3000
    );
    return () => clearInterval(id);
  }, []);

  /* ── Parallax léger sur desktop ── */
  const handleParallax = useCallback(() => {
    if (!imgRef.current) return;
    if (window.innerWidth < 1025) return;
    const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    imgRef.current.style.transform = `scale(1.06) translateY(${p * 60}px)`;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();
    return () => window.removeEventListener('scroll', handleParallax);
  }, [handleParallax]);

  const scrollDown = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="hv2-section"
      aria-label="UB Mindset — Collection Automne-Hiver 2026"
    >

      {/* ══════════════════════════════════════════
          IMAGE PLEINE HAUTEUR (droite sur desktop,
          fond complet sur mobile)
          ══════════════════════════════════════════ */}
      <div className="hv2-img-col">
        <img
          ref={imgRef}
          src="/hero-desktop.webp"
          srcSet="/hero-mobile.webp 480w, /hero-desktop.webp 1024w"
          sizes="(max-width: 768px) 100vw, 40vw"
          alt="Athlète UB Mindset — Collection AH 2026"
          className="hv2-img"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable="false"
        />

        {/* Gradient de fondu — droite vers gauche sur desktop */}
        <div className="hv2-img-fade-left" aria-hidden="true" />
        {/* Gradient de fondu — bas sur mobile */}
        <div className="hv2-img-fade-bottom" aria-hidden="true" />

        {/* Badge NEW DROP */}
        <div className={`hv2-badge ${entered ? 'hv2-badge--in' : ''}`} aria-label="Nouvelle collection">
          <span className="hv2-badge-text">NEW DROP</span>
          <span className="hv2-badge-dot" aria-hidden="true" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLONNE TEXTE
          ══════════════════════════════════════════ */}
      <div className="hv2-content">

        {/* Taglines verticales gauche */}
        <div className={`hv2-tags-v ${entered ? 'hv2-tags-v--in' : ''}`} aria-hidden="true">
          {['DISCIPLINE', 'FOCUS', 'PROGRESSION'].map((w, i) => (
            <React.Fragment key={w}>
              {i > 0 && <div className="hv2-sep-v" />}
              <span className="hv2-tag-v">{w}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Micro-label */}
        <p className={`hv2-label ${entered ? 'hv2-label--in' : ''}`}>
          SPORTSWEAR · MINDSET · PREMIUM
        </p>

        {/* Titre principal */}
        <div className="hv2-title-wrap">
          <h1 className="hv2-title">
            <span className={`hv2-title-line hv2-line1 ${entered ? 'hv2-line--in' : ''}`}>
              L'UNIFORME
            </span>
            <span className={`hv2-title-line hv2-line2 ${entered ? 'hv2-line--in' : ''}`}>
              DU MENTAL
            </span>
          </h1>
        </div>

        {/* Ligne de séparation */}
        <div className={`hv2-divider ${entered ? 'hv2-divider--in' : ''}`} />

        {/* Sous-titre */}
        <p className={`hv2-subtitle ${entered ? 'hv2-subtitle--in' : ''}`}>
          Collection Automne–Hiver 2026 &nbsp;·&nbsp; Édition limitée
        </p>

        {/* Groupe de CTA */}
        <div className={`hv2-cta-group ${entered ? 'hv2-cta-group--in' : ''}`}>
          <Link to="/catalog" className="hv2-cta-primary">
            <span>VOIR LA COLLECTION</span>
            <svg width="18" height="7" viewBox="0 0 18 7" fill="none" aria-hidden="true">
              <path d="M0 3.5H16M13 1L16.5 3.5L13 6" stroke="currentColor" strokeWidth="0.9"/>
            </svg>
          </Link>
          <Link to="/lookbook" className="hv2-cta-secondary">
            Lookbook →
          </Link>
        </div>

        {/* Trust bar */}
        <div className={`hv2-trust ${entered ? 'hv2-trust--in' : ''}`} aria-live="polite">
          {TRUST_ITEMS.map((item, i) => (
            <span
              key={item.label}
              className={`hv2-trust-item ${i === trustIdx ? 'hv2-trust-item--active' : ''}`}
              aria-hidden={i !== trustIdx}
            >
              <span className="hv2-trust-icon">{item.icon}</span>
              <span className="hv2-trust-label">{item.label}</span>
            </span>
          ))}
        </div>

        {/* Label bas gauche */}
        <p className={`hv2-edition ${entered ? 'hv2-edition--in' : ''}`} aria-hidden="true">
          © 2026 — VOL.01 &nbsp;·&nbsp; DAKAR · PARIS
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className={`hv2-scroll ${entered ? 'hv2-scroll--in' : ''}`}
        aria-label="Défiler vers la section suivante"
      >
        <span className="hv2-scroll-label">SCROLL</span>
        <div className="hv2-scroll-line" aria-hidden="true" />
      </button>

      {/* ── STYLES ── */}
      <style>{`

        /* ════════════════════════════════════════
           SECTION
           ════════════════════════════════════════ */
        .hv2-section {
          position: relative;
          width: 100%;
          height: 100dvh;
          min-height: 620px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #E8E7E3;
        }

        /* ════════════════════════════════════════
           IMAGE COLONNE
           ════════════════════════════════════════ */
        .hv2-img-col {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hv2-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transform-origin: center top;
          will-change: transform;
        }

        /* Fondu vers le bas (mobile — pour lisibilité du texte overlay) */
        .hv2-img-fade-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 65%;
          background: linear-gradient(
            to top,
            rgba(232, 231, 227, 0.98) 0%,
            rgba(232, 231, 227, 0.80) 35%,
            rgba(232, 231, 227, 0.30) 65%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* Fondu vers la gauche — masqué sur mobile, visible desktop */
        .hv2-img-fade-left {
          display: none;
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(232, 231, 227, 1)    0%,
            rgba(232, 231, 227, 0.97) 10%,
            rgba(232, 231, 227, 0.70) 38%,
            rgba(232, 231, 227, 0.10) 60%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* Badge NEW DROP */
        .hv2-badge {
          position: absolute;
          top: 100px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
        }
        .hv2-badge--in {
          opacity: 1;
          transform: translateY(0);
        }
        .hv2-badge-text {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.44rem;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          color: #0A0A0A;
          background: rgba(242,241,239,0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 6px 10px;
          border: 1px solid rgba(10,10,10,0.10);
          border-radius: 2px;
        }
        .hv2-badge-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #0A0A0A;
          animation: badgePulse 2s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }

        /* ════════════════════════════════════════
           CONTENU TEXTE
           ════════════════════════════════════════ */
        .hv2-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          flex: 1;
          padding: 104px 24px 100px;
        }

        /* Taglines verticales */
        .hv2-tags-v {
          display: none;
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.6s ease 1.1s;
        }
        .hv2-tags-v--in { opacity: 1; }

        .hv2-tag-v {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 600;
          font-size: 0.44rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #8C8C8C;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        .hv2-sep-v {
          width: 1px;
          height: 32px;
          background: #C4C3C0;
          flex-shrink: 0;
        }

        /* Micro-label */
        .hv2-label {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.36em;
          color: #6A6A6A;
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s;
        }
        .hv2-label--in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Titre */
        .hv2-title-wrap { margin-bottom: 18px; overflow: hidden; }

        .hv2-title {
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 0.95;
          letter-spacing: -0.02em;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .hv2-title-line {
          display: block;
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .hv2-line1 {
          font-size: clamp(2.8rem, 10vw, 3.2rem);
          color: #0A0A0A;
          transition-delay: 0.25s;
        }
        .hv2-line2 {
          font-size: clamp(2.8rem, 10vw, 3.2rem);
          color: #5A5A5A;
          transition-delay: 0.38s;
        }
        .hv2-line--in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Diviseur */
        .hv2-divider {
          width: 0;
          height: 1px;
          background: #C4C3C0;
          margin-bottom: 14px;
          transition: width 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s;
        }
        .hv2-divider--in { width: 36px; }

        /* Sous-titre */
        .hv2-subtitle {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: 0.56rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #6A6A6A;
          margin-bottom: 26px;
          opacity: 0;
          transition: opacity 0.5s ease 0.6s;
        }
        .hv2-subtitle--in { opacity: 1; }

        /* Groupe CTA */
        .hv2-cta-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease 0.7s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.7s;
        }
        .hv2-cta-group--in {
          opacity: 1;
          transform: translateY(0);
        }

        /* CTA primaire */
        .hv2-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          color: #F2F1EF;
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 16px 28px;
          background: #0A0A0A;
          border-radius: 2px;
          border: none;
          align-self: flex-start;
          transition: background 0.25s ease, gap 0.3s ease, transform 0.2s ease;
        }
        .hv2-cta-primary:hover {
          background: #2A2A2A;
          gap: 22px;
          transform: translateY(-2px);
        }
        .hv2-cta-primary:active {
          transform: scale(0.97);
        }

        /* CTA secondaire */
        .hv2-cta-secondary {
          display: inline-block;
          text-decoration: none;
          color: #6A6A6A;
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }
        .hv2-cta-secondary:hover { color: #0A0A0A; }

        /* Trust bar */
        .hv2-trust {
          position: relative;
          height: 20px;
          margin-bottom: 32px;
          opacity: 0;
          transition: opacity 0.5s ease 0.85s;
        }
        .hv2-trust--in { opacity: 1; }

        .hv2-trust-item {
          position: absolute;
          top: 0; left: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
          white-space: nowrap;
        }
        .hv2-trust-item--active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .hv2-trust-icon {
          font-size: 0.6rem;
          color: #8C8C8C;
        }
        .hv2-trust-label {
          font-family: "Archivo Narrow", sans-serif;
          font-weight: 500;
          font-size: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #8C8C8C;
        }

        /* Label édition */
        .hv2-edition {
          position: absolute;
          bottom: 28px;
          left: 24px;
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.44rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #C4C3C0;
          opacity: 0;
          transition: opacity 0.5s ease 1s;
        }
        .hv2-edition--in { opacity: 1; }

        /* ════════════════════════════════════════
           SCROLL INDICATOR
           ════════════════════════════════════════ */
        .hv2-scroll {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.5s ease 1.1s, transform 0.5s ease 1.1s;
        }
        .hv2-scroll--in {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .hv2-scroll-label {
          font-family: "Archivo Narrow", sans-serif;
          font-size: 0.42rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          color: rgba(100,100,100,0.55);
        }
        .hv2-scroll-line {
          width: 1px;
          height: 28px;
          background: rgba(100,100,100,0.30);
          animation: hv2ScrollPulse 2.2s ease-in-out infinite;
        }
        @keyframes hv2ScrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(1.25); }
        }

        /* ════════════════════════════════════════
           MOBILE — ≤768px
           ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .hv2-img {
            object-position: center 6% !important;
          }
          .hv2-img-fade-bottom {
            height: 56% !important;
          }
          .hv2-content {
            justify-content: flex-end !important;
            padding: 84px 20px 58px !important;
          }
          .hv2-title-wrap {
            margin-bottom: 12px !important;
          }
          .hv2-divider {
            margin-bottom: 10px !important;
          }
          .hv2-subtitle {
            margin-bottom: 18px !important;
          }
          .hv2-cta-group {
            margin-bottom: 18px !important;
          }
          .hv2-trust {
            margin-bottom: 20px !important;
          }
          .hv2-edition {
            display: none !important;
          }
        }

        /* ════════════════════════════════════════
           TABLETTE — 769px à 1024px
           ════════════════════════════════════════ */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hv2-section {
            flex-direction: row;
          }
          .hv2-img-col {
            position: relative;
            inset: auto;
            flex: 1;
            order: 2;
          }
          .hv2-img-fade-bottom { display: none; }
          .hv2-img-fade-left { display: block; order: 2; }
          .hv2-img {
            height: 100dvh;
            object-position: center top;
            transform: scale(1.06) translateY(0);
          }
          .hv2-content {
            order: 1;
            width: 55%;
            flex-shrink: 0;
            padding: 100px 40px 76px 52px;
            justify-content: flex-end;
          }
          .hv2-line1, .hv2-line2 {
            font-size: clamp(3.4rem, 5vw, 4.2rem);
          }
          .hv2-badge { top: 90px; right: auto; left: 58%; }
          .hv2-cta-group { flex-direction: row; align-items: center; }
          .hv2-edition { left: 52px; }
          .hv2-scroll { left: 48%; }
          .hv2-tags-v { display: flex; }
        }

        /* ════════════════════════════════════════
           DESKTOP — ≥1025px
           ════════════════════════════════════════ */
        @media (min-width: 1025px) {
          .hv2-section {
            flex-direction: row;
          }
          .hv2-img-col {
            position: relative;
            inset: auto;
            flex: 1;
            order: 2;
          }
          .hv2-img-fade-bottom { display: none; }
          .hv2-img-fade-left {
            display: block;
          }
          .hv2-img {
            height: 100dvh;
            object-position: center top;
            transform: scale(1.06) translateY(0);
          }
          .hv2-content {
            order: 1;
            width: 58%;
            flex-shrink: 0;
            padding: 120px 60px 84px 88px;
            justify-content: flex-end;
          }
          .hv2-line1, .hv2-line2 {
            font-size: clamp(4rem, 5.5vw, 5.5rem);
          }
          .hv2-badge {
            top: 110px;
            right: auto;
            left: 61%;
          }
          .hv2-cta-group {
            flex-direction: row;
            align-items: center;
            gap: 28px;
          }
          .hv2-tags-v { display: flex; }
          .hv2-edition { left: 88px; }
          .hv2-scroll { left: 47%; }
        }

        /* ════════════════════════════════════════
           PETIT MOBILE — ≤ 480px
           ════════════════════════════════════════ */
        @media (max-width: 480px) {
          .hv2-img {
            object-position: center 4% !important;
          }
          .hv2-line1, .hv2-line2 {
            font-size: clamp(2.3rem, 8.5vw, 2.7rem);
          }
          .hv2-content {
            padding: 80px 18px 52px !important;
          }
          .hv2-cta-primary {
            width: 100%;
            justify-content: center;
          }
        }

        /* ════════════════════════════════════════
           REDUCED MOTION
           ════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .hv2-title-line,
          .hv2-label,
          .hv2-subtitle,
          .hv2-divider,
          .hv2-cta-group,
          .hv2-trust,
          .hv2-badge,
          .hv2-edition,
          .hv2-tags-v,
          .hv2-scroll {
            transition: none !important;
            animation: none !important;
          }
          .hv2-title-line { opacity: 1 !important; transform: none !important; }
          .hv2-label--in,
          .hv2-subtitle--in,
          .hv2-cta-group--in,
          .hv2-trust--in,
          .hv2-badge--in,
          .hv2-edition--in,
          .hv2-tags-v--in,
          .hv2-scroll--in { opacity: 1 !important; transform: translateX(-50%) !important; }
          .hv2-divider--in { width: 36px !important; }
          .hv2-scroll-line { animation: none !important; }
          .hv2-badge-dot { animation: none !important; }
          .hv2-trust-item { transition: none !important; }
        }

      `}</style>
    </section>
  );
}
