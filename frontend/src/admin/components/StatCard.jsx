import React from 'react';

const ICON_MAP = {
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

export default function StatCard({ item, index = 0 }) {
  const { id, title, value, evolution, period, icon, sparkline } = item;

  // Sparkline : aire dégradée + ligne + point terminal
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline);
  const range = maxVal - minVal || 1;
  const width = 78;
  const height = 26;

  const coords = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 6) - 3;
    return { x, y };
  });

  const points = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const lastPoint = coords[coords.length - 1];
  const gradientId = `ub-spark-${id}`;

  return (
    <article className="ub-stat-card">
      <div className="ub-stat-header">
        <div className="ub-stat-icon-box" aria-hidden="true">
          {ICON_MAP[icon] || ICON_MAP.cart}
        </div>
        <span className="ub-stat-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="ub-stat-body">
        <p className="ub-stat-title">{title}</p>
        <h3 className="ub-stat-value">{value}</h3>
      </div>

      <div className="ub-stat-footer">
        <div className="ub-stat-trend">
          <span className="ub-stat-badge">
            <span className="ub-stat-arrow">↗</span> {evolution}
          </span>
          <span className="ub-stat-period">{period}</span>
        </div>

        {/* Mini sparkline curve */}
        <div className="ub-stat-sparkline">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#171717" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#171717" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={'url(#' + gradientId + ')'} />
            <polyline
              fill="none"
              stroke="#0A0A0A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            <circle cx={lastPoint.x.toFixed(1)} cy={lastPoint.y.toFixed(1)} r={2.6} fill="#171717" />
          </svg>
        </div>
      </div>
    </article>
  );
}
