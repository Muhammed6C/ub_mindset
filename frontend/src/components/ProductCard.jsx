import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {product.is_new && (
          <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Nouveau
          </span>
        )}

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            to={`/product/${product.id}`}
            className="p-3 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-transform transform translate-y-2 group-hover:translate-y-0 duration-200 shadow-lg"
            title="Voir le produit"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={() => addToCart(product, 1)}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-transform transform translate-y-2 group-hover:translate-y-0 duration-200 shadow-lg"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {product.category?.name || 'Collection Mindset'}
          </span>
          <h3 className="mt-1 font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            <Link to={`/product/${product.id}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-lg font-black text-slate-900">
            {formattedPrice}
          </span>
          <button
            onClick={() => addToCart(product, 1)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            + Panier
          </button>
        </div>
      </div>
    </div>
  );
}
