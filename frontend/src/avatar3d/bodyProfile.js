// BodyProfile : fonction centrale et pure qui transforme les mensurations
// (taille, poids) + la morphologie déclarée en un profil corporel normalisé,
// exploitable par le moteur 3D (morph targets + échelle verticale).
//
// Important : la morphologie déclarée est le signal principal ; l'IMC n'est
// qu'un appoint secondaire et n'est jamais utilisé comme vérité unique.

import { AVATAR_CONFIG } from './avatarConfig.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const clamp01 = (value) => clamp(value, 0, 1);
const round1 = (value) => Math.round(value * 10) / 10;

function resolveMorphology(morphology) {
  return AVATAR_CONFIG.morphology[morphology] ? morphology : 'athletique';
}

// Vérifications de base : renvoie la liste des avertissements (jamais bloquant).
export function validateMeasurements({ heightCm, weightKg, morphology } = {}) {
  const warnings = [];
  const height = Number(heightCm);
  const weight = Number(weightKg);
  const { heightCm: heightBounds, weightKg: weightBounds } = AVATAR_CONFIG.bounds;

  if (!Number.isFinite(height) || height < heightBounds.min || height > heightBounds.max) {
    warnings.push(`Taille hors plage réaliste (${heightBounds.min}–${heightBounds.max} cm).`);
  }
  if (!Number.isFinite(weight) || weight < weightBounds.min || weight > weightBounds.max) {
    warnings.push(`Poids hors plage réaliste (${weightBounds.min}–${weightBounds.max} kg).`);
  }
  if (!AVATAR_CONFIG.morphology[morphology]) {
    warnings.push('Morphologie inconnue, profil « athlétique » appliqué par défaut.');
  }
  return warnings;
}

// Estimations indicatives de tour de corps (cm) — informatives, non médicales.
function estimateMeasurements({ height, buildScore }) {
  const delta = height - AVATAR_CONFIG.referenceHeightCm;
  return {
    shouldersCm: round1(42 + buildScore * 9 + delta * 0.1),
    chestCm: round1(88 + buildScore * 14 + delta * 0.25),
    waistCm: round1(74 + buildScore * 16 + delta * 0.15),
    hipsCm: round1(92 + buildScore * 12 + delta * 0.2),
  };
}

export function computeBodyProfile({ heightCm, weightKg, morphology } = {}) {
  const { heightCm: heightBounds, weightKg: weightBounds } = AVATAR_CONFIG.bounds;
  const morph = resolveMorphology(morphology);

  const height = clamp(Number(heightCm) || AVATAR_CONFIG.referenceHeightCm, heightBounds.min, heightBounds.max);
  const weight = clamp(Number(weightKg) || 70, weightBounds.min, weightBounds.max);

  // 1) La morphologie déclarée porte le signal principal de silhouette.
  const morphologyBuild = AVATAR_CONFIG.morphology[morph].build;

  // 2) Le poids module l'amplitude, autour d'un poids « neutre » pour la taille.
  const neutralWeight = 0.9 * height;
  const weightSignal = clamp((weight - neutralWeight) / 45, -1, 1);

  // 3) L'IMC n'est qu'un appoint secondaire (petit poids).
  const bmi = weight / ((height / 100) ** 2);
  const bmiNudge = clamp((bmi - 23) / 12, -1, 1);

  const buildScore = clamp(
    morphologyBuild * 0.62 + weightSignal * 0.28 + bmiNudge * 0.1,
    -1,
    1,
  );

  // 4) Répartition vers les morph targets normalisés (0.5 ≈ neutre).
  const morphs = {
    shoulders_width: clamp01(0.5 + buildScore * 0.9),
    chest_volume: clamp01(0.5 + buildScore * 0.8),
    waist_width: clamp01(0.5 + buildScore * 0.65 + bmiNudge * 0.15),
    hips_width: clamp01(0.5 + buildScore * 0.5 + bmiNudge * 0.1),
    overall_build: clamp01(0.5 + buildScore),
  };

  // 5) Échelle verticale autour des pieds (pivot sol).
  const heightScale = clamp(height / AVATAR_CONFIG.referenceHeightCm, 0.8, 1.25);

  return {
    heightCm: height,
    weightKg: weight,
    morphology: morph,
    buildScore,
    scales: { height: heightScale },
    morphs,
    measurements: estimateMeasurements({ height, buildScore }),
    warnings: validateMeasurements({ heightCm, weightKg, morphology }),
  };
}
