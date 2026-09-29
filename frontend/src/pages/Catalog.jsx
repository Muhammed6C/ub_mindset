import { Link } from 'react-router-dom';
import { COLLECTION_CATEGORIES } from '../config/collection';
import './Catalog.css';

function CatalogCard({ product }) {
  const content = <><div className="catalog-card__image"><img src={product.image} alt={product.demo ? 'Aperçu visuel à remplacer par le produit final' : product.name} loading="lazy" decoding="async" />{product.tag && <span>{product.tag}</span>}</div><div className="catalog-card__body"><h3>{product.name}</h3><p>{product.subtitle}</p>{!product.demo && <strong>{product.price}</strong>}{product.demo && <small>PRODUIT À VENIR</small>}</div></>;
  return product.demo ? <article className="catalog-card catalog-card--demo">{content}</article> : <Link className="catalog-card" to={`/product/${product.id}`}>{content}</Link>;
}

export default function Catalog() {
  return (
    <main className="catalog-page">
      <header className="catalog-page__intro"><p>UB MINDSET — COLLECTION AH 2026</p><h1>TOUTE LA<br />COLLECTION.</h1><span>Choisis ton terrain. Garde le même mindset.</span></header>
      {COLLECTION_CATEGORIES.map((category) => <section className="catalog-category" key={category.id} aria-labelledby={`catalog-${category.id}`}><header><p>COLLECTION SPORT</p><h2 id={`catalog-${category.id}`}>{category.name}</h2><span>{category.description}</span></header><div className="catalog-category__grid">{category.products.map((product) => <CatalogCard key={product.id} product={product} />)}</div></section>)}
    </main>
  );
}
