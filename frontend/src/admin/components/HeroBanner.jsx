import React from 'react';

export default function HeroBanner({ onStatsClick }) {
  return (
    <div className="ub-hero-banner">
      {/* Background Graphic / Texture / Athlete Silhouette */}
      <div className="ub-hero-bg-visual" />

      {/* ── Left Content ── */}
      <div className="ub-hero-content">
        <span className="ub-hero-badge">UB ATHLETICS</span>
        <h1 className="ub-hero-title">TABLEAU DE BORD</h1>
        <p className="ub-hero-subtitle">Vue d'ensemble de votre activité</p>

        <button
          type="button"
          className="ub-hero-btn"
          onClick={onStatsClick}
        >
          Voir les statistiques →
        </button>
      </div>

      {/* ── Right Sport & Mindset Pillars ── */}
      <div className="ub-hero-pillars">
        <div className="ub-pillars-text">
          <span>DISCIPLINE</span>
          <span>PROGRÈS</span>
          <span>RÉSULTATS</span>
        </div>
        <div className="ub-hero-monogram">
          <img
            src="/logo.png"
            alt="UB MINDSET"
            className="ub-hero-logo-img"
          />
        </div>
      </div>
    </div>
  );
}
