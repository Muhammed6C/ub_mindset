import test from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTION_CATEGORIES } from './collection.js';

test('the collection exposes the three sport rails', () => {
  assert.deepEqual(COLLECTION_CATEGORIES.map(({ name }) => name), ['UB-FOOT', 'UB-BASKET', 'UB-LIFT']);
});

test('each collection rail has enough visual cards to demonstrate scrolling', () => {
  assert.ok(COLLECTION_CATEGORIES.every(({ products }) => products.length >= 4));
  assert.ok(COLLECTION_CATEGORIES.flatMap(({ products }) => products).some(({ demo }) => demo));
});
