import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTION_CATEGORIES } from '../config/collection';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import '../components/Collection.css';
import '../components/CollectionResponsive.css';
import './Catalog.css';

export default function Catalog() {
  const { addToCart } = useCart();
  const handleAddToCart = (product, size) => addToCart(product, 1, { id: size, size });

  return (
    <main className="catalog-page">
      <header className="catalog-page__intro">
        <p>UB MINDSET — COLLECTION AH 2026</p>
        <h1>TOUTE LA<br />COLLECTION.</h1>
        <span>Choisis ton terrain. Garde le même mindset.</span>
        <Link className="catalog-page__avatar-link" to="/essayage">ESSAYER SUR MON AVATAR <span aria-hidden="true">→</span></Link>
      </header>

      {COLLECTION_CATEGORIES.map((category) => (
        <section className="catalog-category" key={category.id} aria-labelledby={`catalog-${category.id}`}>
          <header>
            <p>COLLECTION SPORT</p>
            <h2 id={`catalog-${category.id}`}>{category.name}</h2>
            <span>{category.description}</span>
          </header>
          <div className="catalog-category__grid">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
