import React from 'react';
import { NavLink } from 'react-router-dom';
import { recentOrders } from '../data/dashboardMockData';
import { getAdminImage } from './adminImage';

const STATUS_CLASSES = {
  preparing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
};

export default function RecentOrders() {
  return (
    <div className="ub-card ub-recent-orders-card">
      <div className="ub-card-header">
        <h3 className="ub-card-title">Commandes récentes</h3>
        <NavLink to="/admin/orders" className="ub-card-link">
          Voir tout →
        </NavLink>
      </div>

      <div className="ub-recent-orders-list">
        {recentOrders.map((o) => (
          <div key={o.id} className="ub-recent-order-item">
            <div className="ub-order-thumb">
              <img
                src={getAdminImage(o.image)}
                alt={o.product}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/admin-demo-collection.webp';
                }}
              />
            </div>

            <div className="ub-order-info">
              <div className="ub-order-top-line">
                <span className="ub-order-id">{o.id}</span>
              </div>
              <p className="ub-order-product">
                {o.product} - {o.details}
              </p>
              <p className="ub-order-time">{o.time}</p>
            </div>

            <div className="ub-order-status-wrap">
              <span className={`admin-badge admin-badge--status admin-badge--${STATUS_CLASSES[o.statusType] || 'unknown'}`}>
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
