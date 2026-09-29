import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { COLLECTION_CATEGORIES } from '../config/collection';
import './Collection.css';
import './CollectionResponsive.css';
import './CollectionInteraction.css';

function ProductCard({ product, onAddToCart }) {
  const [size, setSize] = useState(null);
  const [added, setAdded] = useState(false);

  if (product.placeholder) {
    return <article className="collection-card collection-card--placeholder" aria-label={`${product.name}, bientôt disponible`}><span>UB</span><p>{product.tag}</p><h4>{product.name}</h4><small>{product.subtitle}</small></article>;
  }

  if (product.demo) {
    return (
      <article className="collection-card collection-card--demo" aria-label={`${product.name}, aperçu de démonstration`}>
        <div className="collection-card__image"><img src={product.image} alt="Aperçu visuel à remplacer par le produit final" loading="lazy" decoding="async" /><span className="collection-card__tag">{product.tag}</span></div>
        <div className="collection-card__info"><div className="collection-card__title-row"><h4>{product.name}</h4></div><p className="collection-card__subtitle">{product.subtitle}</p></div>
      </article>
    );
  }

  const add = () => {
    if (!size) return;
    onAddToCart(product, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="collection-card">
      <Link className="collection-card__image" to={`/product/${product.id}`} aria-label={`Voir ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        {product.tag && <span className="collection-card__tag">{product.tag}</span>}
      </Link>
      <div className="collection-card__info">
        <div className="collection-card__title-row"><h4>{product.name}</h4><p>{product.originalPrice && <s>{product.originalPrice}</s>}{product.price}</p></div>
        <p className="collection-card__subtitle">{product.subtitle}</p>
        <div className="collection-card__actions" aria-label={`Choisir une taille pour ${product.name}`}>
          <div className="collection-card__sizes">{product.sizes.map((itemSize) => <button key={itemSize} type="button" aria-pressed={size === itemSize} className={size === itemSize ? 'is-selected' : ''} onClick={() => setSize(itemSize)}>{itemSize}</button>)}</div>
          <button type="button" className="collection-card__add" disabled={!size} onClick={add}>{added ? '✓ AJOUTÉ' : size ? 'AJOUTER' : 'TAILLE'}</button>
        </div>
      </div>
    </article>
  );
}

function CollectionRail({ category, onAddToCart }) {
  const railRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);
  const scroll = (direction) => railRef.current?.scrollBy({ left: railRef.current.clientWidth * direction * 0.78, behavior: 'smooth' });

  const endDrag = (event) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
    if (railRef.current?.hasPointerCapture(event.pointerId)) railRef.current.releasePointerCapture(event.pointerId);
  };

  const handlePointerDown = (event) => {
    // Le swipe tactile reste géré nativement par le navigateur ; le drag souris est ajouté pour desktop.
    if (event.pointerType !== 'mouse' || event.button !== 0 || !railRef.current) return;
    dragRef.current = { active: true, startX: event.clientX, scrollLeft: railRef.current.scrollLeft, moved: false };
    setIsDragging(true);
    railRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active || !railRef.current) return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 4) dragRef.current.moved = true;
    railRef.current.scrollLeft = dragRef.current.scrollLeft - distance;
  };

  const preventClickAfterDrag = (event) => {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  };

  return (
    <section className="collection-rail" aria-labelledby={`collection-${category.id}`}>
      <header className="collection-rail__header"><div><p>COLLECTION SPORT</p><h3 id={`collection-${category.id}`}>{category.name}</h3></div><span>{category.description}</span></header>
      <div className="collection-rail__viewport">
        <button className="collection-rail__arrow collection-rail__arrow--previous" type="button" onClick={() => scroll(-1)} aria-label={`Produits précédents ${category.name}`}>←</button>
        <div className={`collection-rail__track${isDragging ? ' is-dragging' : ''}`} ref={railRef} tabIndex="0" aria-label={`Produits ${category.name}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={preventClickAfterDrag}>{category.products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}</div>
        <button className="collection-rail__arrow collection-rail__arrow--next" type="button" onClick={() => scroll(1)} aria-label={`Produits suivants ${category.name}`}>→</button>
      </div>
    </section>
  );
}

export default function Collection() {
  const { addToCart } = useCart();
  const addProduct = (product, size) => addToCart(product, 1, { id: size, size });
  return (
    <section id="collection" className="collection-section" aria-labelledby="collection-heading">
      <header className="collection-section__header"><p>COLLECTION AH — 2026 · ÉDITION LIMITÉE</p><h2 id="collection-heading">CONÇU POUR<span className="collection-heading-space"> </span><br />PERFORMER.</h2><span>Des pièces pensées pour l’effort, la rue et le podium. Choisis ton terrain.</span></header>
      <div className="collection-section__rails">{COLLECTION_CATEGORIES.map((category) => <CollectionRail key={category.id} category={category} onAddToCart={addProduct} />)}</div>
      <footer className="collection-section__footer"><Link to="/essayage" className="collection-section__try-on">ESSAYER MES VÊTEMENTS</Link><Link to="/catalog" className="collection-section__cta">VOIR TOUTE LA COLLECTION <span aria-hidden="true">→</span></Link></footer>
    </section>
  );
}
