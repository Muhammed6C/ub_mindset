import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  const formatPrice = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);

  const shippingCost = cartTotal > 50000 || cartTotal === 0 ? 0 : 3000;
  const grandTotal = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-slate-900">Votre panier est vide</h1>
        <p className="mt-3 text-slate-500 max-w-md mx-auto">
          Explorez notre collection et ajoutez les pièces qui correspondent à votre vision.
        </p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-colors"
        >
          Découvrir nos produits <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900">Mon Panier ({cart.length})</h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.key}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.product.name}</h3>
                  {item.variant && (
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      Taille : {item.variant.size}
                    </span>
                  )}
                  <span className="text-sm font-black text-slate-900 block mt-2 sm:hidden">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <span className="hidden sm:block text-base font-black text-slate-900">
                  {formatPrice(item.price)}
                </span>

                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="p-2 hover:bg-slate-200 text-slate-700 rounded-l-xl"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="p-2 hover:bg-slate-200 text-slate-700 rounded-r-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.key)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Récapitulatif de commande
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total</span>
              <span className="font-semibold text-slate-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frais de livraison</span>
              <span className="font-semibold text-slate-900">
                {shippingCost === 0 ? (
                  <span className="text-emerald-600 font-bold">Gratuit</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
              <span>Total</span>
              <span className="text-indigo-600">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            Passer à la caisse <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-[11px] text-slate-400 text-center">
            Paiements 100% sécurisés. Cartes bancaires & Mobile Money acceptés.
          </p>
        </div>
      </div>
    </div>
  );
}
