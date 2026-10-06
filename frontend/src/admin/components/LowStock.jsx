import React from 'react';
import { NavLink } from 'react-router-dom';
import { lowStockItems } from '../data/dashboardMockData';
import { getAdminImage } from './adminImage';

export default function LowStock() {
  return (
    <div className="ub-card ub-low-stock-card">
      <div className="ub-card-header">
        <h3 className="ub-card-title">Stock faible</h3>
        <NavLink to="/admin/stock" className="ub-card-link">
          Voir tout →
        </NavLink>
      </div>

      <div className="ub-low-stock-list">
        {lowStockItems.map((item) => (
          <NavLink
            key={item.id}
            to="/admin/products"
            className="ub-low-stock-item"
          >
            <div className="ub-low-stock-thumb">
              <img
                src={getAdminImage(item.image)}
                alt={item.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/admin-demo-collection.webp';
                }}
              />
            </div>

            <div className="ub-low-stock-info">
              <h4 className="ub-low-stock-name">{item.name}</h4>
              <p className="ub-low-stock-qty">{item.stock}</p>
            </div>

            <div className="ub-low-stock-action">
              <span className="admin-badge admin-badge--warning">
                {item.status}
              </span>
              <span className="ub-low-stock-arrow">›</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
