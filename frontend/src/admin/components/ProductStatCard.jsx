import React from 'react';

const ICON_MAP = {
  package: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export default function ProductStatCard({ icon, value, label, trend, period, index = 0 }) {
  return (
    <article className="ub-stat-card admin-products-stat-card">
      <div className="ub-stat-header">
        <div className="ub-stat-icon-box" aria-hidden="true">
          {ICON_MAP[icon] || ICON_MAP.package}
        </div>
        <span className="ub-stat-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="ub-stat-body">
        <p className="ub-stat-title">{label}</p>
        <h3 className="ub-stat-value">{value}</h3>
      </div>

      <div className="ub-stat-footer">
        <div className="ub-stat-trend">
          <span className="ub-stat-badge">
            <span className="ub-stat-arrow">↗</span> {trend}
          </span>
          <span className="ub-stat-period">{period}</span>
        </div>
      </div>
    </article>
  );
}
