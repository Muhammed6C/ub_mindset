import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        🔥 Livraison offerte dès 50 000 FCFA | Collection Mindset 2026 disponible
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex-1 lg:flex-none text-center lg:text-left">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              UB<span className="text-indigo-600">.</span>MINDSET
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-700">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Accueil
          </Link>
          <Link to="/catalog" className="hover:text-indigo-600 transition-colors">
            Catalogue
          </Link>
          <Link to="/catalog?category=vetements" className="hover:text-indigo-600 transition-colors">
            Vêtements
          </Link>
          <Link to="/catalog?category=accessoires" className="hover:text-indigo-600 transition-colors">
            Accessoires
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4">
          <Link
            to="/catalog"
            className="p-2 text-slate-700 hover:text-indigo-600 transition-colors hidden sm:block"
            title="Recherche"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            to="/checkout"
            className="p-2 text-slate-700 hover:text-indigo-600 transition-colors"
            title="Mon compte"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Cart button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2.5 rounded-full bg-slate-900 text-white hover:bg-indigo-600 transition-colors flex items-center justify-center shadow-sm"
            title="Panier"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-indigo-600"
          >
            Accueil
          </Link>
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-indigo-600"
          >
            Tous les produits
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-indigo-600"
          >
            Mon Panier ({cartCount})
          </Link>
        </div>
      )}
    </header>
  );
}
