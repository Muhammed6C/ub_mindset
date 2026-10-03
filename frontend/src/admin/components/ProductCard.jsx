import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RECENT_PRODUCTS } from '../data/mockData';

const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

export default function ProductCard() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Derniers produits ajoutés</h3>
        <a href="#" className="card-link">
          Voir tout <ArrowRight size={14} />
        </a>
      </div>
      <div className="products-grid">
        {RECENT_PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-card-info">
              <p className="product-card-name">{product.name}</p>
              <p className="product-card-variant">{product.color} / {product.size}</p>
              <p className="product-card-price">{fmtFCFA(product.price)}</p>
              <span className="product-card-stock">{product.stock}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
