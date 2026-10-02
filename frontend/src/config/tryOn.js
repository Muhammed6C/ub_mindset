export const WHATSAPP_NUMBER = '221782773022';

export const TRY_ON_PRODUCT_CONFIG = {
  1: { category: 'haut' },
  2: { category: 'veste' },
  3: { category: 'bas' },
  4: { category: 'haut' },
  5: { category: 'haut' },
  6: { category: 'bas' },
};

export const TRY_ON_CONFIG = {
  measurements: {
    height: { min: 145, max: 205, step: 1, defaultValue: 175, unit: 'cm' },
    weight: { min: 40, max: 130, step: 1, defaultValue: 70, unit: 'kg' },
  },
  sizeRules: [
    { maxScore: 0, size: 'S' },
    { maxScore: 8, size: 'M' },
    { maxScore: 18, size: 'L' },
    { maxScore: Infinity, size: 'XL' },
  ],
};

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
