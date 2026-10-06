import React from 'react';
import { NavLink } from 'react-router-dom';
import { latestProducts } from '../data/dashboardMockData';
import { getAdminImage } from './adminImage';

export default function LatestProducts() {
  return (
    <div className="ub-card ub-latest-products-card">
      <div className="ub-card-header">
        <h3 className="ub-card-title">Derniers produits ajoutés</h3>
        <NavLink to="/admin/products" className="ub-card-link">
          Voir tout →
        </NavLink>
      </div>

      <div className="ub-latest-products-grid">
        {latestProducts.map((p) => (
          <div key={p.id} className="ub-product-tile">
            <div className="ub-product-tile-thumb">
              <img
                src={getAdminImage(p.image)}
                alt={p.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/admin-demo-collection.webp';
                }}
              />
            </div>

            <div className="ub-product-tile-body">
              <h4 className="ub-product-tile-name">{p.name}</h4>
              <p className="ub-product-tile-variant">{p.variant}</p>
              <p className="ub-product-tile-price">{p.price}</p>
              <div className="ub-product-tile-status">
                <span className="ub-status-dot green" />
                <span>{p.stockStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
