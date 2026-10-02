import test from 'node:test';
import assert from 'node:assert/strict';

import { computeBodyProfile, validateMeasurements } from './bodyProfile.js';
import { AVATAR_CONFIG } from './avatarConfig.js';

const MORPH_KEYS = Object.keys(AVATAR_CONFIG.morphTargets);

test('returns every morph target as an influence between 0 and 1', () => {
  const profile = computeBodyProfile({ heightCm: 178, weightKg: 74, morphology: 'athletique' });
  MORPH_KEYS.forEach((key) => {
    assert.ok(key in profile.morphs, `missing morph ${key}`);
    assert.ok(profile.morphs[key] >= 0 && profile.morphs[key] <= 1, `${key} out of range`);
  });
});

test('widens the silhouette from mince to costaud', () => {
  const mince = computeBodyProfile({ heightCm: 178, weightKg: 74, morphology: 'mince' });
  const costaud = computeBodyProfile({ heightCm: 178, weightKg: 74, morphology: 'costaud' });
  assert.ok(costaud.morphs.overall_build > mince.morphs.overall_build);
  assert.ok(costaud.morphs.shoulders_width > mince.morphs.shoulders_width);
  assert.ok(mince.buildScore < 0 && costaud.buildScore > 0);
});

test('reflects height in the vertical scale', () => {
  const short = computeBodyProfile({ heightCm: 160, weightKg: 60, morphology: 'athletique' });
  const tall = computeBodyProfile({ heightCm: 195, weightKg: 88, morphology: 'athletique' });
  assert.ok(tall.scales.height > short.scales.height);
});

test('warns on unrealistic values but still returns a clamped profile', () => {
  const warnings = validateMeasurements({ heightCm: 90, weightKg: 400, morphology: 'xl' });
  assert.ok(warnings.length >= 2);

  const profile = computeBodyProfile({ heightCm: 90, weightKg: 400, morphology: 'xl' });
  assert.equal(profile.heightCm, AVATAR_CONFIG.bounds.heightCm.min);
  assert.equal(profile.weightKg, AVATAR_CONFIG.bounds.weightKg.max);
  assert.equal(profile.morphology, 'athletique');
  assert.ok(profile.warnings.length >= 2);
});

test('handles missing values without throwing', () => {
  const profile = computeBodyProfile();
  assert.equal(profile.morphology, 'athletique');
  MORPH_KEYS.forEach((key) => assert.ok(Number.isFinite(profile.morphs[key])));
});
