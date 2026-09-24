import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  // Mock product detail
  const product = {
    id: Number(id) || 1,
    name: 'Hoodie Oversize "Relentless Mindset"',
    price: 35000,
    category: { name: 'Vêtements' },
    description:
      'Conçu en coton lourd 450 GSM pour un tombé impeccable et un confort thermique optimal. Coupe oversize moderne avec broderie discrète haute précision sur la poitrine et slogan au dos.',
    features: [
      '100% Coton peigné haut de gamme 450g/m²',
      'Capuche doublée sans cordon pour un look minimaliste épuré',
      'Poche kangourou renforcée',
      'Fabriqué de manière éthique et durable',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
  };

  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Visual */}
        <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Specifications */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {product.category.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-slate-900 mt-4">
              {formattedPrice}
            </p>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Size selection */}
          {product.sizes && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Sélectionner la Taille :
              </span>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white px-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-slate-500 hover:text-slate-900 px-2 py-3 text-lg font-bold"
              >
                -
              </button>
              <span className="px-4 font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-slate-500 hover:text-slate-900 px-2 py-3 text-lg font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity, { id: selectedSize, size: selectedSize })}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-indigo-600/30"
            >
              <ShoppingBag className="w-5 h-5" /> Ajouter au Panier
            </button>
          </div>

          {/* Features list */}
          <div className="pt-6 border-t border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Caractéristiques :</h4>
            {product.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Trust points */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Livraison 48h</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Retour 14j</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Paiement Garanti</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
