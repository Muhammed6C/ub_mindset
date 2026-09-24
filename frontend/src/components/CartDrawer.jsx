import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isDrawerOpen) return null;

  const formatPrice = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Mon Panier</h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Votre panier est vide</p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:underline"
                >
                  Découvrir la collection &rarr;
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.key} className="flex gap-4 pb-6 border-b border-slate-100">
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{item.product.name}</h4>
                    {item.variant && (
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Taille: {item.variant.size}
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-900 block mt-1">
                      {formatPrice(item.price)}
                    </span>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with totals */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Sous-total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Taxes et frais de livraison calculés à la finalisation de la commande.
              </p>
              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  Commander <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center block text-xs font-semibold text-slate-600 hover:text-slate-900 py-2"
                >
                  Voir le panier complet
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
