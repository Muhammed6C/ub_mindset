// Configuration de la collection : chaque catégorie alimente les rails de la page d'accueil et la grille du catalogue.
export const COLLECTION_CATEGORIES = [
  {
    id: 'foot',
    name: 'UB-FOOT',
    description: 'POUR LE TERRAIN, AVANT ET APRÈS LE COUP D’ENVOI.',
    products: [
      { id: 2, name: 'VESTE WIND BREAKER', subtitle: 'Ripstop imperméable — Zip YKK', price: '195 €', tag: 'NOUVEAU', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 6, name: 'SHORT TRAINING', subtitle: 'Dry-fit — Poche zippée', price: '75 €', tag: 'ÉDITION LTD.', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'foot-03', name: 'CHASUBLE TRAINING', subtitle: 'Mesh respirant haute intensité', price: '65 €', tag: 'TERRAIN', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'foot-04', name: 'PANTALON FUSEAU PRO', subtitle: 'Coupe athlétique — Zips chevilles', price: '105 €', tag: 'PRO', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'foot-05', name: 'COUPE-VENT TRACK', subtitle: 'Tissu technique déperlant', price: '130 €', tag: 'ESSENTIAL', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'foot-06', name: 'MAILLOT HYBRID', subtitle: 'Fibre thermo-régulatrice', price: '80 €', tag: 'DROP 01', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
    ],
  },
  {
    id: 'basket',
    name: 'UB-BASKET',
    description: 'LE VOLUME, L’AMPLITUDE, LA CONFIANCE.',
    products: [
      { id: 1, name: 'HOODIE TECH', subtitle: 'Fleece 380g — Coupe oversize', price: '140 €', tag: 'BEST-SELLER', image: '/store-collection.webp', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: 4, name: 'T-SHIRT ESSENTIAL', subtitle: 'Coton pima 220g — Col rond', price: '85 €', originalPrice: '110 €', tag: 'PROMO', image: '/store-collection2.webp', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { id: 5, name: 'SWEAT OVERSIZED', subtitle: 'French terry 300g — Col montant', price: '120 €', tag: 'OVERSIZE', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'basket-04', name: 'SHORT MESH PRO', subtitle: 'Double couche aérée — Poches zippées', price: '70 €', tag: 'COURT', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'basket-05', name: 'DÉBARDEUR ARENA', subtitle: 'Col dégagé — Liberté de tir', price: '55 €', tag: 'LÉGER', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'basket-06', name: 'CREWNECK COURTSIDE', subtitle: 'Molleton brossé lourd 420g', price: '115 €', tag: 'PREMIUM', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
    ],
  },
  {
    id: 'lift',
    name: 'UB-LIFT',
    description: 'CONÇU POUR LA RÉPÉTITION QUI CHANGE TOUT.',
    products: [
      { id: 3, name: 'LEGGING PERFORMANCE', subtitle: 'Compression 4-way stretch', price: '110 €', tag: 'COMPRESSION', image: '/store-collection.webp', sizes: ['XS', 'S', 'M', 'L'] },
      { id: 'lift-02', name: 'T-SHIRT COMPRESSION', subtitle: 'Maintien musculaire ciblé', price: '75 €', tag: 'FORCE', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'lift-03', name: 'SHORT HYBRID LIFT', subtitle: 'Fentes latérales profondes', price: '65 €', tag: 'INTENSE', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'lift-04', name: 'SWEAT SANS MANCHES', subtitle: 'Capuche structurée — Coton lourd', price: '90 €', tag: 'STREET', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'lift-05', name: 'JOGGER TAPERED', subtitle: 'Tissu stretch quadri-directionnel', price: '110 €', tag: 'FIT', image: '/store-collection.webp', sizes: ['S', 'M', 'L', 'XL'] },
      { id: 'lift-06', name: 'BASELAYER SEAMLESS', subtitle: 'Zéro frottement — Coutures plates', price: '85 €', tag: 'SEAMLESS', image: '/store-collection2.webp', sizes: ['S', 'M', 'L', 'XL'] },
    ],
  },
];
