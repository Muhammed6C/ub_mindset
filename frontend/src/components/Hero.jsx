import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/image-hero-official.png';

const LEFT_BG = '#E2E1DE';

const LEFT_TAGS  = ['DISCIPLINE', 'FOCUS', 'PROGRESSION'];
const RIGHT_TAGS = ['BUILT', 'THROUGH', 'PAIN'];

export default function Hero() {
  const imgRef     = useRef(null);
  const sectionRef = useRef(null);

  const handleParallax = useCallback(() => {
    if (!imgRef.current) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    imgRef.current.style.transform = `scale(0.82) translateY(${70 + progress * 45}px)`;
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
      className="hero-section"
    >
      {/* ═══════════════════════════════════════════════
          COLONNE GAUCHE — texte
          ════════════════════════════════════════════ */}
      <div className="hero-left-col">
        {/* ── Taglines verticales GAUCHE ── */}
        <div className="anim-hidden anim-slide-left anim-delay-800 hero-tags-left">
          {LEFT_TAGS.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <div className="hero-tag-sep" />}
              <span className="hero-tag hero-tag-left">{tag}</span>
            </React.Fragment>
          ))}
        </div>

        {/* ── Label catégorie ── */}
        <p className="anim-hidden anim-fade-in anim-delay-200 hero-category">
          SPORTSWEAR · MINDSET · PREMIUM
        </p>

        {/* ── Grand titre ── */}
        <div className="anim-hidden anim-fade-in-up anim-delay-400 hero-title-wrap">
          <h1 className="hero-title">
            <span className="hero-title-line1">Plus qu'une</span>{' '}
            <span className="hero-title-line1">marque,</span>{' '}
            <span className="hero-title-line2">Un état</span>{' '}
            <span className="hero-title-line2">d'esprit</span>
          </h1>
        </div>

        {/* ── Séparateur ── */}
        <div className="anim-hidden anim-fade-in anim-delay-600 hero-separator" />

        {/* ── Sous-titre saison ── */}
        <p className="anim-hidden anim-fade-in anim-delay-600 hero-season">
          COLLECTION AUTOMNE–HIVER 2026
        </p>

        {/* ── CTA ── */}
        <div className="anim-hidden anim-fade-in-up anim-delay-800 hero-cta-wrap">
          <Link to="/catalog" className="hero-cta">
            DÉCOUVRIR LA COLLECTION
            <svg width="20" height="8" viewBox="0 0 18 7" fill="none">
              <path d="M0 3.5H16M13 1L16.5 3.5L13 6" stroke="#FFFFFF" strokeWidth="0.85"/>
            </svg>
          </Link>
        </div>

        {/* ── Coin bas gauche — édition ── */}
        <p className="anim-hidden anim-fade-in anim-delay-1200 hero-edition">
          © 2026 — VOL.01
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          COLONNE DROITE — image + éléments décoratifs
          ════════════════════════════════════════════ */}
      <div className="hero-right-col">
        {/* Image du mannequin — fond transparent */}
        <img
          ref={imgRef}
          src={heroImg}
          alt="UB Mindset — Collection 2026"
          className="hero-img"
        />

        {/* ── Taglines verticales DROITE ── */}
        <div className="anim-hidden anim-slide-right anim-delay-800 hero-tags-right">
          {RIGHT_TAGS.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <div className="hero-tag-sep hero-tag-sep-right" />}
              <span className="hero-tag hero-tag-right">{tag}</span>
            </React.Fragment>
          ))}
        </div>

        {/* ── Coin bas droite ── */}
        <p className="anim-hidden anim-fade-in anim-delay-1200 hero-dakar">
          DAKAR · PARIS
        </p>
      </div>

      {/* ── Indicateur SCROLL — bas centre ── */}
      <button
        onClick={scrollDown}
        className="anim-hidden anim-fade-in anim-delay-1200 hero-scroll"
        aria-label="Défiler vers le bas"
      >
        <span className="hero-scroll-label">SCROLL</span>
        <div className="hero-scroll-line" />
      </button>

      <style>{`
        /* ══════════════════════════════════════════════
           BASE — MOBILE FIRST
           ════════════════════════════════════════════ */
        .hero-section {
          position: sticky !important;
          top: 0 !important;
          width: 100% !important;
          height: 100dvh !important;
          min-height: 600px !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          z-index: 1 !important;
          background: linear-gradient(160deg, #E8E7E3 0%, #E2E1DE 45%, #D8D7D3 100%) !important;
        }

        .hero-left-col {
          position: relative !important;
          width: 100% !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-end !important;
          padding: 100px 28px 40px !important;
          z-index: 3 !important;
        }

        .hero-right-col {
          position: absolute !important;
          inset: 0 !important;
          z-index: 1 !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .hero-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center bottom !important;
          transform: scale(0.82) translateY(70px) !important;
          display: block !important;
        }

        .hero-tags-left,
        .hero-tags-right {
          display: none !important;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 10px !important;
        }
        .hero-tags-left  { left: 22px !important; }
        .hero-tags-right { right: 18px !important; }

        .hero-tag {
          font-family: "Archivo Narrow", sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.48rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.28em !important;
          color: #8C8C8C !important;
          writing-mode: vertical-rl !important;
        }
        .hero-tag-left  { transform: rotate(180deg) !important; }
        .hero-tag-right { color: rgba(140,140,140,0.7) !important; }
        .hero-tag-sep { width: 1px !important; height: 36px !important; background: #C4C3C0 !important; }
        .hero-tag-sep-right { background: rgba(140,140,140,0.4) !important; }

        .hero-category {
          font-family: "Archivo Narrow", sans-serif !important;
          font-weight: 500 !important;
          font-size: 0.5rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.35em !important;
          color: #6a6a6a !important;
          margin-bottom: 12px !important;
        }

        .hero-title-wrap { margin-bottom: 14px !important; }

        .hero-title {
          font-family: "Archivo", sans-serif !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          color: #0A0A0A !important;
          font-size: 3rem !important;
          line-height: 1.05 !important;
          letter-spacing: -0.01em !important;
          margin-bottom: 1.5rem !important;
        }

        .hero-title-line1 {
          color: #0A0A0A !important;
        }

        .hero-title-line2 {
          color: #6B6B6B !important;
        }

        .hero-separator { width: 32px !important; height: 1px !important; background: #C4C3C0 !important; margin-bottom: 12px !important; }

        .hero-season {
          font-family: "Archivo Narrow", sans-serif !important;
          font-weight: 500 !important;
          font-size: 0.6rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.3em !important;
          color: #6a6a6a !important;
          margin-bottom: 20px !important;
        }

        .hero-cta-wrap { display: inline-block !important; }

        .hero-cta {
          display: inline-flex !important;
          align-items: center !important;
          gap: 14px !important;
          text-decoration: none !important;
          color: #FFFFFF !important;
          font-family: "Archivo Narrow", sans-serif !important;
          font-weight: 700 !important;
          font-size: 1rem !important;
          letter-spacing: 0.3em !important;
          text-transform: uppercase !important;
          padding: 18px 32px !important;
          background: #000000 !important;
          border: none !important;
          border-radius: 2px !important;
          transition: background 0.3s ease, gap 0.3s ease, transform 0.2s ease !important;
        }
        .hero-cta:hover {
          background: #2A2A2A !important;
          gap: 22px !important;
          transform: translateY(-2px) !important;
        }

        .hero-edition,
        .hero-dakar { display: none !important; }

        .hero-edition {
          position: absolute !important;
          bottom: 28px !important;
          left: 80px !important;
          font-family: "Archivo Narrow", sans-serif !important;
          font-size: 0.48rem !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.28em !important;
          color: #C4C3C0 !important;
        }
        .hero-dakar {
          position: absolute !important;
          bottom: 28px !important;
          right: 36px !important;
          font-family: "Archivo Narrow", sans-serif !important;
          font-size: 0.48rem !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.28em !important;
          color: rgba(140,140,140,0.6) !important;
          text-align: right !important;
        }

        .hero-scroll {
          position: absolute !important;
          bottom: 16px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 8px !important;
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          z-index: 10 !important;
        }
        .hero-scroll-label {
          font-family: "Archivo Narrow", sans-serif !important;
          font-size: 0.44rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.35em !important;
          color: rgba(100,100,100,0.6) !important;
        }
        .hero-scroll-line {
          width: 1px !important;
          height: 28px !important;
          background: rgba(100,100,100,0.35) !important;
          animation: scrollPulse 2.2s ease-in-out infinite !important;
        }

        /* ══════════════════════════════════════════════
           PETIT MOBILE — ≤480px
           ════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .hero-left-col { padding: 90px 20px 32px !important; }
          .hero-title { font-size: 2.4rem !important; }
        }

        /* ══════════════════════════════════════════════
           TABLETTE — 769px à 1024px
           ════════════════════════════════════════════ */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-section { flex-direction: row !important; }
          .hero-left-col { width: 68% !important; flex-shrink: 0 !important; padding: 0 40px 60px 56px !important; }
          .hero-right-col { position: relative !important; flex: 1 !important; inset: auto !important; }
          .hero-img { object-position: center center !important; }
          .hero-title { font-size: 4.5rem !important; line-height: 0.92 !important; }
          .hero-category { font-size: 0.56rem !important; color: #8C8C8C !important; margin-bottom: 20px !important; }
          .hero-season { font-size: 0.54rem !important; color: #8C8C8C !important; margin-bottom: 32px !important; }
          .hero-cta { font-size: 1.1rem !important; }
          .hero-edition { display: block !important; left: 56px !important; }
          .hero-dakar { display: block !important; }
          .hero-scroll { left: 47% !important; bottom: 28px !important; }
          .hero-scroll-label { font-size: 0.48rem !important; color: #8C8C8C !important; }
          .hero-scroll-line { height: 32px !important; background: #C4C3C0 !important; }
        }

        /* ══════════════════════════════════════════════
           DESKTOP — ≥1025px
           ════════════════════════════════════════════ */
        @media (min-width: 1025px) {
          .hero-section { flex-direction: row !important; }
          .hero-left-col { width: 65% !important; flex-shrink: 0 !important; padding: 0 56px 80px 80px !important; }
          .hero-right-col { position: relative !important; flex: 1 !important; inset: auto !important; }
          .hero-tags-left, .hero-tags-right { display: flex !important; }
          .hero-title { font-size: 4rem !important; }
          .hero-category { font-size: 0.56rem !important; color: #8C8C8C !important; }
          .hero-season { font-size: 0.54rem !important; color: #8C8C8C !important; }
          .hero-cta { font-size: 1.05rem !important; }
          .hero-edition, .hero-dakar { display: block !important; }
          .hero-scroll { left: 47% !important; bottom: 28px !important; }
          .hero-scroll-label { font-size: 0.48rem !important; color: #8C8C8C !important; }
          .hero-scroll-line { height: 32px !important; background: #C4C3C0 !important; }
        }

        /* ══════════════════════════════════════════════
           ACCESSIBILITÉ — reduced motion
           ════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-line { animation: none !important; }
          .anim-fade-in, .anim-fade-in-up, .anim-slide-left, .anim-slide-right {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }

      `}</style>
    </section>
  );
}
