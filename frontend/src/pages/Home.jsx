import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Hoodie Oversize "Relentless Mindset"',
    price: 35000,
    is_new: true,
    category: { name: 'Vêtements' },
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'T-Shirt Signature UB Heavyweight',
    price: 18000,
    is_new: true,
    category: { name: 'Vêtements' },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Casquette Streetwear "Focus & Conquer"',
    price: 12000,
    is_new: false,
    category: { name: 'Accessoires' },
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Gourde Isotherme Noir Mat 750ml',
    price: 15000,
    is_new: false,
    category: { name: 'Accessoires' },
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    // Attempt fetch from backend API, fall back to mock
    api.get('/products')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {
        // Using mock products as fallback
      });
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 py-20 px-8 sm:px-12 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80"
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />

        <div className="relative z-20 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Nouvelle Collection 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Élevez Votre Style.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Forgez Votre Mindset.
            </span>
          </h1>
          <p className="mt-6 text-slate-300 text-lg sm:text-xl font-normal leading-relaxed">
            Des pièces de mode et des essentiels d'exception pour ceux qui ne cessent jamais de progresser.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/catalog"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-colors shadow-lg shadow-indigo-600/30"
            >
              Découvrir la Boutique <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/catalog?category=vetements"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors backdrop-blur-sm"
            >
              Vêtements
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Qualité Supérieure</h3>
              <p className="mt-1 text-sm text-slate-500">Matières nobles, coutures renforcées et finitions soignées.</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Éditions Limitées</h3>
              <p className="mt-1 text-sm text-slate-500">Des drops exclusifs pour affirmer votre singularité.</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Impact & Vision</h3>
              <p className="mt-1 text-sm text-slate-500">Une communauté soudée par la quête d'excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Sélection Exclusive</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Nos Meilleures Ventes</h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
          >
            Voir toute la collection &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
