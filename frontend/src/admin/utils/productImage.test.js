import assert from 'node:assert/strict';
import { test } from 'node:test';
import { convertProductImageToWebp } from './productImage.js';

test('keeps an image that is already WebP unchanged', async () => {
  const file = new File(['webp'], 'photo.webp', { type: 'image/webp' });
  assert.equal(await convertProductImageToWebp(file), file);
});

test('converts supported images to WebP', async () => {
  const previousCreateImageBitmap = globalThis.createImageBitmap;
  const previousDocument = globalThis.document;
  let closed = false;
  globalThis.createImageBitmap = async () => ({
    width: 2,
    height: 3,
    close: () => { closed = true; },
  });
  globalThis.document = {
    createElement: () => ({
      getContext: () => ({ drawImage() {} }),
      toBlob: (callback, type) => callback(new Blob(['converted'], { type })),
    }),
  };

  try {
    const converted = await convertProductImageToWebp(
      new File(['source'], 'photo.png', { type: 'image/png' }),
    );
    assert.equal(converted.name, 'photo.webp');
    assert.equal(converted.type, 'image/webp');
    assert.equal(closed, true);
  } finally {
    if (previousCreateImageBitmap === undefined) delete globalThis.createImageBitmap;
    else globalThis.createImageBitmap = previousCreateImageBitmap;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('rejects unsupported file types', async () => {
  const file = new File(['text'], 'not-an-image.txt', { type: 'text/plain' });
  await assert.rejects(convertProductImageToWebp(file), /Choisissez une image/);
});
