// ═══════════════════════════════════════════════════════════════════════════
// UB MINDSET — DONNÉES MOCKÉES DASHBOARD ADMIN
// Séparation données / présentation pour faciliter la connexion API future
// ═══════════════════════════════════════════════════════════════════════════

export const KPIS = {
  totalSales: {
    value: 2847500,
    label: 'Total des ventes',
    unit: 'FCFA',
    delta: '+18%',
    trend: 'up',
    sparkline: [120, 180, 150, 220, 280, 240, 320, 380, 350, 420, 480, 520],
  },
  orders: {
    value: 248,
    label: 'Commandes',
    unit: 'CMD',
    delta: '+24%',
    trend: 'up',
    sparkline: [20, 35, 28, 45, 52, 48, 65, 72, 68, 85, 92, 105],
  },
  newCustomers: {
    value: 186,
    label: 'Nouveaux clients',
    unit: '',
    delta: '+32%',
    trend: 'up',
    sparkline: [10, 18, 15, 25, 32, 28, 40, 48, 45, 58, 65, 78],
  },
  productsSold: {
    value: 1024,
    label: 'Produits vendus',
    unit: '',
    delta: '+21%',
    trend: 'up',
    sparkline: [80, 120, 100, 150, 180, 160, 210, 250, 230, 290, 320, 360],
  },
};

export const SALES_CHART_DATA = {
  '7J': [
    { label: 'Lun', ventes: 45000, commandes: 3 },
    { label: 'Mar', ventes: 52000, commandes: 4 },
    { label: 'Mer', ventes: 48000, commandes: 3 },
    { label: 'Jeu', ventes: 61000, commandes: 5 },
    { label: 'Ven', ventes: 78000, commandes: 6 },
    { label: 'Sam', ventes: 92000, commandes: 7 },
    { label: 'Dim', ventes: 85000, commandes: 6 },
  ],
  '30J': [
    { label: '1', ventes: 45000, commandes: 3 },
    { label: '5', ventes: 120000, commandes: 8 },
    { label: '10', ventes: 85000, commandes: 6 },
    { label: '15', ventes: 210000, commandes: 14 },
    { label: '20', ventes: 165000, commandes: 11 },
    { label: '25', ventes: 290000, commandes: 19 },
    { label: '30', ventes: 340000, commandes: 23 },
  ],
  '3M': [
    { label: 'Juil', ventes: 850000, commandes: 65 },
    { label: 'Août', ventes: 1200000, commandes: 89 },
    { label: 'Sep', ventes: 1450000, commandes: 108 },
  ],
  '1A': [
    { label: 'Oct', ventes: 1200000, commandes: 89 },
    { label: 'Nov', ventes: 1450000, commandes: 108 },
    { label: 'Déc', ventes: 1800000, commandes: 134 },
    { label: 'Jan', ventes: 1650000, commandes: 122 },
    { label: 'Fév', ventes: 1900000, commandes: 141 },
    { label: 'Mar', ventes: 2200000, commandes: 164 },
    { label: 'Avr', ventes: 2100000, commandes: 157 },
    { label: 'Mai', ventes: 2400000, commandes: 179 },
    { label: 'Juin', ventes: 2600000, commandes: 194 },
    { label: 'Juil', ventes: 2800000, commandes: 210 },
    { label: 'Août', ventes: 3100000, commandes: 232 },
    { label: 'Sep', ventes: 2847500, commandes: 248 },
  ],
};

export const POPULAR_PRODUCTS = [
  {
    id: 1,
    name: 'T-shirt Oversize',
    collection: 'Collection Essentials',
    price: 42500,
    sales: 324,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Long Sleeve',
    collection: 'Collection Training',
    price: 55000,
    sales: 218,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Jogging',
    collection: 'Collection Performance',
    price: 75000,
    sales: 162,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 4,
    name: 'Gants de musculation',
    collection: 'Accessoires',
    price: 18000,
    sales: 98,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=200&q=80',
  },
];

export const RECENT_ORDERS = [
  {
    id: 1,
    orderNumber: '#UB2025083174',
    product: 'T-shirt Oversize - Noir / L',
    size: 'L',
    date: "Aujourd'hui, 10:24",
    status: 'En préparation',
    statusType: 'pending',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 2,
    orderNumber: '#UB2025083173',
    product: 'Jogging - Gris / XL',
    size: 'XL',
    date: "Aujourd'hui, 09:47",
    status: 'Expédiée',
    statusType: 'shipped',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 3,
    orderNumber: '#UB2025083172',
    product: 'Long Sleeve - Blanc / M',
    size: 'M',
    date: 'Hier, 18:32',
    status: 'Livrée',
    statusType: 'delivered',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 4,
    orderNumber: '#UB2025083171',
    product: 'T-shirt Oversize - Noir / M',
    size: 'M',
    date: 'Hier, 16:21',
    status: 'En préparation',
    statusType: 'pending',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 5,
    orderNumber: '#UB2025083170',
    product: 'Gants - L',
    size: 'L',
    date: 'Hier, 14:05',
    status: 'Expédiée',
    statusType: 'shipped',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=100&q=80',
  },
];

export const LOW_STOCK = [
  {
    id: 1,
    name: 'T-shirt Oversize noir',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 2,
    name: 'Jogging gris',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 3,
    name: 'Gants de musculation',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=100&q=80',
  },
];

export const RECENT_PRODUCTS = [
  {
    id: 1,
    name: 'T-shirt Oversize',
    color: 'Noir',
    size: 'L',
    price: 42500,
    stock: 'En stock',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Long Sleeve',
    color: 'Blanc',
    size: 'L',
    price: 55000,
    stock: 'En stock',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Jogging',
    color: 'Gris',
    size: 'XL',
    price: 75000,
    stock: 'En stock',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    name: 'Gants de musculation',
    color: 'Noir',
    size: 'L',
    price: 18000,
    stock: 'En stock',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80',
  },
];

export const SALES_DISTRIBUTION = [
  { label: 'T-shirts', value: 38, color: '#0A0A0A' },
  { label: 'Pantalons', value: 26, color: '#3A3A3A' },
  { label: 'Manches longues', value: 18, color: '#6B6B6B' },
  { label: 'Accessoires', value: 10, color: '#9C9C9C' },
  { label: 'Autres', value: 8, color: '#C4C4C4' },
];

export const ADMIN_USER = {
  name: 'Seydina Cissé',
  role: 'Administrateur',
  avatar: 'SC',
};
