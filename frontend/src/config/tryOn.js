export const WHATSAPP_NUMBER = '221782773022';

export const TRY_ON_PRODUCT_CONFIG = {
  1: { category: 'haut', asset: '/essayage/hoodie-tech.svg' },
  2: { category: 'veste', asset: '/essayage/veste-wind-breaker.svg' },
  3: { category: 'bas', asset: '/essayage/legging-performance.svg' },
  4: { category: 'haut', asset: '/essayage/tshirt-essential.svg' },
  5: { category: 'haut', asset: '/essayage/sweat-oversized.svg' },
  6: { category: 'bas', asset: '/essayage/short-training.svg' },
};

export const TRY_ON_CONFIG = {
  measurements: {
    height: { min: 145, max: 205, step: 1, defaultValue: 175, unit: 'cm' },
    weight: { min: 40, max: 130, step: 1, defaultValue: 70, unit: 'kg' },
  },
  morphology: {
    homme: { mince: 20.5, athletique: 26 },
    femme: { mince: 19.5, athletique: 25 },
  },
  mannequins: {
    homme: {
      mince: '/mannequins/homme/mince.svg',
      athletique: '/mannequins/homme/athletique.svg',
      costaud: '/mannequins/homme/costaud.svg',
    },
    femme: {
      mince: '/mannequins/femme/mince.svg',
      athletique: '/mannequins/femme/athletique.svg',
      costaud: '/mannequins/femme/costaud.svg',
    },
  },
  placements: {
    homme: {
      mince: {
        bas: { top: '47%', left: '50%', width: '50%', zIndex: 2 },
        haut: { top: '19%', left: '50%', width: '62%', zIndex: 3 },
        veste: { top: '16%', left: '50%', width: '66%', zIndex: 4 },
      },
      athletique: {
        bas: { top: '47%', left: '50%', width: '54%', zIndex: 2 },
        haut: { top: '18%', left: '50%', width: '67%', zIndex: 3 },
        veste: { top: '15%', left: '50%', width: '71%', zIndex: 4 },
      },
      costaud: {
        bas: { top: '47%', left: '50%', width: '59%', zIndex: 2 },
        haut: { top: '18%', left: '50%', width: '73%', zIndex: 3 },
        veste: { top: '15%', left: '50%', width: '78%', zIndex: 4 },
      },
    },
    femme: {
      mince: {
        bas: { top: '47%', left: '50%', width: '49%', zIndex: 2 },
        haut: { top: '20%', left: '50%', width: '57%', zIndex: 3 },
        veste: { top: '17%', left: '50%', width: '62%', zIndex: 4 },
      },
      athletique: {
        bas: { top: '47%', left: '50%', width: '53%', zIndex: 2 },
        haut: { top: '19%', left: '50%', width: '63%', zIndex: 3 },
        veste: { top: '16%', left: '50%', width: '68%', zIndex: 4 },
      },
      costaud: {
        bas: { top: '47%', left: '50%', width: '58%', zIndex: 2 },
        haut: { top: '19%', left: '50%', width: '69%', zIndex: 3 },
        veste: { top: '16%', left: '50%', width: '74%', zIndex: 4 },
      },
    },
  },
  sizeRules: [
    { maxScore: 0, size: 'S' },
    { maxScore: 8, size: 'M' },
    { maxScore: 18, size: 'L' },
    { maxScore: Infinity, size: 'XL' },
  ],
};

export function getMorphology(gender, height, weight) {
  const safeHeight = Number(height);
  const safeWeight = Number(weight);
  const thresholds = TRY_ON_CONFIG.morphology[gender] || TRY_ON_CONFIG.morphology.homme;
  const bmi = safeWeight / ((safeHeight / 100) ** 2);

  if (!Number.isFinite(bmi) || safeHeight <= 0 || safeWeight <= 0) return 'athletique';
  if (bmi < thresholds.mince) return 'mince';
  if (bmi < thresholds.athletique) return 'athletique';
  return 'costaud';
}

export function getRecommendedSize(product, height, weight) {
  const sizes = product?.sizes || [];
  if (!sizes.length) return null;

  const score = (Number(weight) - 70) + ((Number(height) - 175) * 0.25);
  const preferred = TRY_ON_CONFIG.sizeRules.find((rule) => score <= rule.maxScore)?.size || sizes.at(-1);
  const scale = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const preferredIndex = scale.indexOf(preferred);
  return sizes.includes(preferred)
    ? preferred
    : sizes.find((size) => scale.indexOf(size) > preferredIndex) || sizes.at(-1);
}

export function buildWhatsAppUrl(items) {
  const lines = items.map((item) => `• ${item.product.name} — Taille ${item.selectedSize || 'à confirmer'} × ${item.quantity || 1}`);
  const message = ['Bonjour UB Mindset, je souhaite commander :', ...lines].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
