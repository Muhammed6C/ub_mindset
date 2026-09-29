import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getMorphology,
  getRecommendedSize,
  buildWhatsAppUrl,
} from './tryOn.js';

test('classifies the visual morphology using the configured thresholds', () => {
  assert.equal(getMorphology('homme', 180, 62), 'mince');
  assert.equal(getMorphology('homme', 180, 76), 'athletique');
  assert.equal(getMorphology('femme', 165, 82), 'costaud');
});

test('selects an available recommended clothing size and falls back safely', () => {
  assert.equal(getRecommendedSize({ sizes: ['S', 'M', 'L', 'XL'] }, 180, 76), 'M');
  assert.equal(getRecommendedSize({ sizes: ['S', 'L'] }, 180, 76), 'L');
  assert.equal(getRecommendedSize({ sizes: [] }, 180, 76), null);
});

test('builds an encoded WhatsApp order URL including product, size, and quantity', () => {
  const url = buildWhatsAppUrl([
    { product: { name: 'HOODIE TECH' }, selectedSize: 'M', quantity: 2 },
  ]);

  assert.match(url, /^https:\/\/wa\.me\/221782773022\?text=/);
  assert.match(decodeURIComponent(url), /HOODIE TECH — Taille M × 2/);
});
