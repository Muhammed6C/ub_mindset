import React from 'react';
import { NavLink } from 'react-router-dom';
import { popularProducts } from '../data/dashboardMockData';

export default function PopularProducts() {
  return (
    <div className="ub-card ub-popular-card">
      <div className="ub-card-header">
        <h3 className="ub-card-title">Produits populaires</h3>
        <NavLink to="/admin/products" className="ub-card-link">
          Voir tout →
        </NavLink>
      </div>

      <div className="ub-popular-list">
        {popularProducts.map((p) => (
          <div key={p.id} className="ub-popular-item">
            <div className="ub-popular-thumb">
              <img
                src={p.image}
                alt={p.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/demo-collection.png';
                }}
              />
            </div>

            <div className="ub-popular-info">
              <h4 className="ub-popular-name">{p.name}</h4>
              <p className="ub-popular-sub">{p.collection}</p>
              <p className="ub-popular-price">{p.price}</p>
            </div>

            <div className="ub-popular-meta">
              <span className="ub-popular-sales">
                {p.sales} <span className="ub-sales-arrow">↗</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
