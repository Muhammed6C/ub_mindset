import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

export default function ProductCard({ product, onAddToCart }) {
  const { addToCart } = useCart();
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;
  const [size, setSize] = useState(null);
  const [added, setAdded] = useState(false);

  const displayPrice = product.price || '95 €';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Si aucune taille n'est cochée, on choisit automatiquement la taille médiane (M ou 1ère disponible)
    const chosenSize = size || availableSizes[Math.min(1, availableSizes.length - 1)];
    if (!size) {
      setSize(chosenSize);
    }

    if (onAddToCart) {
      onAddToCart(product, chosenSize);
    } else {
      addToCart(product, 1, { id: chosenSize, size: chosenSize });
    }

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleSelectSize = (e, itemSize) => {
    e.preventDefault();
    e.stopPropagation();
    setSize(itemSize);
  };

  return (
    <article className="collection-card" aria-label={product.name}>
      {/* Zone Image sans lien ni redirection */}
      <div className="collection-card__image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
        {product.tag && (
          <span className="collection-card__tag">{product.tag}</span>
        )}
      </div>

      {/* Informations produit */}
      <div className="collection-card__info">
        <div className="collection-card__title-row">
          <h4>{product.name}</h4>
          <p>
            {product.originalPrice && <s>{product.originalPrice}</s>}
            {displayPrice}
          </p>
        </div>

        <p className="collection-card__subtitle">{product.subtitle}</p>

        {/* Sélection de taille et bouton Ajouter */}
        <div className="collection-card__actions" aria-label={`Choisir une taille pour ${product.name}`}>
          <div className="collection-card__sizes">
            {availableSizes.map((itemSize) => (
              <button
                key={itemSize}
                type="button"
                aria-pressed={size === itemSize}
                className={size === itemSize ? 'is-selected' : ''}
                onClick={(e) => handleSelectSize(e, itemSize)}
              >
                {itemSize}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`collection-card__add ${added ? 'is-added' : ''}`}
            onClick={handleAdd}
            aria-label={added ? 'Ajouté au panier' : `Ajouter ${product.name} au panier`}
          >
            {added ? '✓ AJOUTÉ' : size ? 'AJOUTER' : 'AJOUTER'}
          </button>
        </div>
      </div>
    </article>
  );
}
