import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvatarProfile, getLayeredAvatarItems } from './avatarExperience.js';

test('falls back to the default avatar profile', () => {
  assert.equal(getAvatarProfile('inconnu').id, 'homme');
});

test('orders wearable pieces from lower to outer layers', () => {
  const items = [
    { enabled: true, product: { id: 2 } },
    { enabled: true, product: { id: 3 } },
    { enabled: true, product: { id: 1 } },
    { enabled: false, product: { id: 4 } },
  ];
  assert.deepEqual(getLayeredAvatarItems(items).map((item) => item.product.id), [3, 1, 2]);
});
