import React from 'react';

export default function HeroBanner({ onStatsClick }) {
  return (
    <section className="ub-hero-banner">
      {/* ── Left Content ── */}
      <div className="ub-hero-content">
        <h2 className="ub-hero-title">TABLEAU DE BORD</h2>

        <button
          type="button"
          className="ub-hero-btn"
          onClick={onStatsClick}
        >
          Voir les statistiques
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* ── Right Editorial Visual ── */}
      <div className="ub-hero-figure" aria-hidden="true">
        <img
          src="/assets/admin-dashboard-hero.webp"
          alt=""
          className="ub-hero-img"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
