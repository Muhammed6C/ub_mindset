// Ajouter ou déplacer un produit ici : chaque rail lit directement son tableau `products`.
export const COLLECTION_CATEGORIES = [
  {
    id: 'foot', name: 'UB-FOOT', description: 'POUR LE TERRAIN, AVANT ET APRÈS LE COUP D’ENVOI.',
    products: [
      { id: 2, name: 'VESTE WIND BREAKER', subtitle: 'Ripstop imperméable — Zip YKK', price: '195 €', tag: 'NOUVEAU', image: '/demo-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 6, name: 'SHORT TRAINING', subtitle: 'Dry-fit — Poche zippée', price: '75 €', tag: 'ÉDITION LTD.', image: '/demo-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'foot-demo-01', name: 'UB-FOOT — APERÇU 01', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection.webp', demo: true },
      { id: 'foot-demo-02', name: 'UB-FOOT — APERÇU 02', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
      { id: 'foot-demo-03', name: 'UB-FOOT — APERÇU 03', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection.webp', demo: true },
      { id: 'foot-demo-04', name: 'UB-FOOT — APERÇU 04', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
    ],
  },
  {
    id: 'basket', name: 'UB-BASKET', description: 'LE VOLUME, L’AMPLITUDE, LA CONFIANCE.',
    products: [
      { id: 1, name: 'HOODIE TECH', subtitle: 'Fleece 380g — Coupe oversize', price: '140 €', tag: 'BEST-SELLER', image: '/demo-collection.webp', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: 4, name: 'T-SHIRT ESSENTIAL', subtitle: 'Coton pima 220g — Col rond', price: '85 €', originalPrice: '110 €', tag: 'PROMO', image: '/demo-collection2.webp', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { id: 5, name: 'SWEAT OVERSIZED', subtitle: 'French terry 300g — Col montant', price: '120 €', image: '/demo-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'basket-demo-01', name: 'UB-BASKET — APERÇU 01', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
      { id: 'basket-demo-02', name: 'UB-BASKET — APERÇU 02', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection.webp', demo: true },
      { id: 'basket-demo-03', name: 'UB-BASKET — APERÇU 03', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
    ],
  },
  {
    id: 'lift', name: 'UB-LIFT', description: 'CONÇU POUR LA RÉPÉTITION QUI CHANGE TOUT.',
    products: [
      { id: 3, name: 'LEGGING PERFORMANCE', subtitle: 'Compression 4-way stretch', price: '110 €', image: '/demo-collection.webp', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'lift-demo-01', name: 'UB-LIFT — APERÇU 01', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
      { id: 'lift-demo-02', name: 'UB-LIFT — APERÇU 02', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection.webp', demo: true },
      { id: 'lift-demo-03', name: 'UB-LIFT — APERÇU 03', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
      { id: 'lift-demo-04', name: 'UB-LIFT — APERÇU 04', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection.webp', demo: true },
      { id: 'lift-demo-05', name: 'UB-LIFT — APERÇU 05', subtitle: 'IMAGE DÉMO — À REMPLACER', tag: 'APERÇU', image: '/demo-collection2.webp', demo: true },
    ],
  },
];
