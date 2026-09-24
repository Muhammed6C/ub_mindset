import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-24">
      {/* Guarantees */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <Truck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Livraison Express</h4>
              <p className="text-xs text-slate-400">Expédition rapide et soignée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Paiement Sécurisé</h4>
              <p className="text-xs text-slate-400">Transactions 100% chiffrées</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RotateCcw className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Retours Faciles</h4>
              <p className="text-xs text-slate-400">14 jours pour changer d'avis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Headphones className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Service Client 24/7</h4>
              <p className="text-xs text-slate-400">Une équipe dédiée à votre écoute</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <span className="text-2xl font-black tracking-tight text-white">
            UB<span className="text-indigo-500">.</span>MINDSET
          </span>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Plus qu'une marque, un état d'esprit. Des articles haut de gamme conçus pour inspirer la détermination et l'excellence.
          </p>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Navigation</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Accueil</Link></li>
            <li><Link to="/catalog" className="hover:text-indigo-400 transition-colors">Tous les produits</Link></li>
            <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Mon Panier</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Informations</h5>
          <ul className="space-y-2 text-sm">
            <li><span className="text-slate-400">Conditions Générales de Vente</span></li>
            <li><span className="text-slate-400">Politique de Confidentialité</span></li>
            <li><span className="text-slate-400">Guide des Tailles</span></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Newsletter</h5>
          <p className="text-sm text-slate-400 mb-4">
            Recevez nos sorties exclusives et offres privilèges directement par email.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 flex-1"
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              OK
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} UB Mindset. Tous droits réservés. Propulsé par Laravel & React.
      </div>
    </footer>
  );
}
