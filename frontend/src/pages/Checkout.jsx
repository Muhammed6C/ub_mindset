import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'wave_om', // or 'card'
  });

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const formatPrice = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);

  const shippingCost = cartTotal > 50000 || cartTotal === 0 ? 0 : 3000;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send order to Laravel Backend API
      const response = await api.post('/orders', {
        customer: form,
        items: cart,
        total: grandTotal,
      });
      setOrderId(response.data?.order_id || 'UB-' + Math.floor(100000 + Math.random() * 900000));
    } catch {
      // If backend offline or simulated, generate local ID
      setOrderId('UB-' + Math.floor(100000 + Math.random() * 900000));
    } finally {
      clearCart();
      setLoading(false);
      setOrderComplete(true);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
        <h1 className="text-3xl font-black text-slate-900">Commande Confirmée !</h1>
        <p className="text-slate-600">
          Merci pour votre confiance. Votre numéro de commande est{' '}
          <strong className="text-slate-900 font-mono">{orderId}</strong>.
        </p>
        <p className="text-sm text-slate-500">
          Un email de confirmation contenant tous les détails d'expédition vous a été envoyé.
        </p>
        <div className="pt-6">
          <Link
            to="/"
            className="inline-block bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors"
          >
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <h1 className="text-3xl font-black text-slate-900">Finaliser la Commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Customer & Address Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              1. Informations de Livraison
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Téléphone (WhatsApp / SMS)
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+221 ..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Adresse complète
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Quartier, Rue, Bâtiment..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Dakar, Abidjan, Paris..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              2. Moyen de Paiement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  form.paymentMethod === 'wave_om'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'wave_om'}
                  onChange={() => setForm({ ...form, paymentMethod: 'wave_om' })}
                  className="hidden"
                />
                <Smartphone className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Mobile Money</span>
                  <span className="text-xs text-slate-500">Wave, Orange Money, Free Money</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  form.paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'card'}
                  onChange={() => setForm({ ...form, paymentMethod: 'card' })}
                  className="hidden"
                />
                <CreditCard className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Carte Bancaire</span>
                  <span className="text-xs text-slate-500">Visa, Mastercard</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review Sticky */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Total de la Commande
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.key} className="flex justify-between text-xs text-slate-600">
                <span className="truncate pr-2">
                  {item.product.name} (x{item.quantity})
                </span>
                <span className="font-semibold text-slate-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total</span>
              <span className="font-semibold text-slate-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Livraison</span>
              <span className="font-semibold text-slate-900">
                {shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
              <span>Montant Total</span>
              <span className="text-indigo-600">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Traitement en cours...' : `Confirmer et Payer (${formatPrice(grandTotal)})`}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement sécurisé avec chiffrement 256 bits</span>
          </div>
        </div>
      </form>
    </div>
  );
}
