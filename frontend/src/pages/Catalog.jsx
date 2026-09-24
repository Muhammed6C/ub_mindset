import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Hoodie Oversize "Relentless Mindset"',
    price: 35000,
    category: { name: 'vetements' },
    is_new: true,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'T-Shirt Signature UB Heavyweight',
    price: 18000,
    category: { name: 'vetements' },
    is_new: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Casquette Streetwear "Focus & Conquer"',
    price: 12000,
    category: { name: 'accessoires' },
    is_new: false,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Gourde Isotherme Noir Mat 750ml',
    price: 15000,
    category: { name: 'accessoires' },
    is_new: false,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: 'Sweat Crewneck "Unstoppable"',
    price: 30000,
    category: { name: 'vetements' },
    is_new: true,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    name: 'Sac de Sport Gym & Voyage UB',
    price: 28000,
    category: { name: 'accessoires' },
    is_new: false,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products
    .filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.id - a.id;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900">Boutique & Catalogue</h1>
        <p className="mt-2 text-slate-600">Découvrez l'ensemble de nos collections et accessoires.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'vetements', label: 'Vêtements' },
            { id: 'accessoires', label: 'Accessoires' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input and Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-600 bg-slate-50"
          >
            <option value="popular">Trier par : Nouveautés</option>
            <option value="price-asc">Prix : Croissant</option>
            <option value="price-desc">Prix : Décroissant</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Aucun produit trouvé</h3>
          <p className="text-sm text-slate-500 mt-1">Essayez de modifier vos filtres ou termes de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
