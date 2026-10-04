// Source unique de vérité pour le studio avatar.
// Les modèles GLB réels, coiffures et vêtements peuvent être ajoutés ici sans modifier l'interface.

export const AVATAR_PROFILES = [
  { id: 'homme', label: 'HOMME', modelUrl: '/avatar/mannequin_homme_base.glb', fallbackId: null, status: 'ready' },
  { id: 'femme', label: 'FEMME', modelUrl: '/avatar/mannequin_femme_base.glb', fallbackId: 'homme', status: 'demo' },
  { id: 'neutre', label: 'NEUTRE', modelUrl: '/avatar/mannequin_neutre_base.glb', fallbackId: 'homme', status: 'demo' },
];

export const AVATAR_OPTIONS = {
  skinTones: [
    { id: 'ebene', label: 'ÉBÈNE', color: '#4a3027' },
    { id: 'brun', label: 'BRUN', color: '#8d5c43' },
    { id: 'ambre', label: 'AMBRE', color: '#c28a67' },
    { id: 'clair', label: 'CLAIR', color: '#e0b698' },
  ],
  hairstyles: [
    { id: 'court', label: 'COURT' },
    { id: 'boucles', label: 'BOUCLES' },
    { id: 'tresses', label: 'TRESSES' },
    { id: 'rase', label: 'RASÉ' },
  ],
  styles: [
    { id: 'studio', label: 'STUDIO' },
    { id: 'terrain', label: 'TERRAIN' },
    { id: 'street', label: 'STREET' },
  ],
};

// Une pièce peut fournir assetUrl dès qu'un GLB skinné est livré.
// `layer` détermine l'ordre de superposition et `fallbackColor` garde un aperçu premium en attendant.
export const AVATAR_GARMENTS = {
  1: { category: 'haut', layer: 20, assetUrl: null, fallbackColor: '#181818' },
  2: { category: 'veste', layer: 40, assetUrl: null, fallbackColor: '#30302e' },
  3: { category: 'bas', layer: 10, assetUrl: null, fallbackColor: '#141414' },
  4: { category: 'haut', layer: 20, assetUrl: null, fallbackColor: '#ebe6dc' },
  5: { category: 'haut', layer: 20, assetUrl: null, fallbackColor: '#6e706d' },
  6: { category: 'bas', layer: 10, assetUrl: null, fallbackColor: '#222422' },
};

export const AVATAR_EXPERIENCE_CONFIG = {
  storageKey: 'ub_avatar_profile',
  storageVersion: 1,
  defaultProfile: {
    avatarId: 'homme', skinTone: 'brun', hairstyle: 'court', style: 'studio',
  },
  camera: { minDistance: 1.6, maxDistance: 5.4, defaultView: 'front' },
};

export function getAvatarProfile(id) {
  return AVATAR_PROFILES.find((profile) => profile.id === id) || AVATAR_PROFILES[0];
}

export function getRenderableAvatar(id) {
  const avatar = getAvatarProfile(id);
  if (!avatar.fallbackId) return avatar;
  const fallback = getAvatarProfile(avatar.fallbackId);
  return { ...avatar, resolvedModelUrl: avatar.modelUrl, fallbackModelUrl: fallback.modelUrl };
}

export function getLayeredAvatarItems(items) {
  return items
    .filter((item) => item.enabled && AVATAR_GARMENTS[item.product.id])
    .toSorted((left, right) => AVATAR_GARMENTS[left.product.id].layer - AVATAR_GARMENTS[right.product.id].layer);
}
