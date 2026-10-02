// Configuration centrale du système d'avatar 3D d'essayage virtuel (UB Mindset).
// Ce fichier décrit le contrat entre le modèle Blender (GLB) et le code :
// emplacement du modèle, noms des morph targets, bornes réalistes et morphologies.
// Réutilisable pour tout le catalogue (aucune dépendance à une page en particulier).

export const AVATAR_CONFIG = {
  // Modèle fourni sous Blender. Fichier servi depuis frontend/public/avatar/.
  modelUrl: '/avatar/mannequin_homme_base.glb',

  // Taille (cm) correspondant à l'échelle 1 du modèle : sert de référence
  // pour l'échelle verticale (taille de l'utilisateur / taille de référence).
  referenceHeightCm: 175,

  // Morph targets : clé logique -> morph target réel du GLB.
  // `model` = nom exact du morph target dans Blender ; `direction` = -1 inverse
  // la direction (ex. Waist_Slim : 1 = taille PLUS FINE, donc inversé).
  morphTargets: {
    shoulders_width: { zone: 'épaules', label: 'Épaules', model: 'Shoulders_Wide', direction: 1 },
    chest_volume: { zone: 'poitrine', label: 'Poitrine', model: 'Chest_Broad', direction: 1 },
    waist_width: { zone: 'taille', label: 'Taille', model: 'Waist_Slim', direction: -1 },
    hips_width: { zone: 'hanches', label: 'Hanches', model: 'Hips_Wide', direction: 1 },
    overall_build: { zone: 'carrure', label: 'Carrure', model: 'Overall_Bulky', direction: 1 },
  },

  // Bornes réalistes de saisie. min/max = bornes dures (clamp), typical = plage usuelle.
  bounds: {
    heightCm: { min: 140, max: 210, typical: [150, 205] },
    weightKg: { min: 35, max: 160, typical: [45, 140] },
  },

  // Morphologie déclarée par l'utilisateur : signal PRINCIPAL de la silhouette.
  // `build` : -1 = très fin, 0 = neutre, +1 = très large.
  morphology: {
    mince: { build: -0.6, label: 'Mince' },
    athletique: { build: 0.0, label: 'Athlétique' },
    costaud: { build: 0.7, label: 'Costaud' },
  },
};
