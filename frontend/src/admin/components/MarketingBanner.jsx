import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MarketingBanner() {
  return (
    <div className="ub-card ub-marketing-banner-card">
      {/* Background with dark luxury sportswear athlete */}
      <div className="ub-marketing-banner-bg" />

      <div className="ub-marketing-banner-content">
        <span className="ub-marketing-tag">UB MINDSET</span>
        <h3 className="ub-marketing-title">
          COLLECTION<br />
          AUTOMNE-HIVER 2026
        </h3>
        <p className="ub-marketing-desc">
          Préparez la prochaine saison.
        </p>

        <NavLink
          to="/admin/products"
          className="ub-marketing-btn"
        >
          Gérer la collection →
        </NavLink>
      </div>
    </div>
  );
}
