import test from 'node:test';
import assert from 'node:assert/strict';

import { LOOKBOOK_SCENES } from './lookbook.js';

test('defines five ordered scenes with a title, image, and collection destination', () => {
  assert.equal(LOOKBOOK_SCENES.length, 5);
  assert.deepEqual(LOOKBOOK_SCENES.map((scene) => scene.number), ['01', '02', '03', '04', '05']);

  LOOKBOOK_SCENES.forEach((scene) => {
    assert.ok(scene.title);
    assert.match(scene.image, /^\/lookbook\/scene-\d\d\.(svg|webp)$/);
    assert.equal(scene.destination, '/#collection');
  });
});
