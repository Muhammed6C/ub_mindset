const CONVERTIBLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/avif',
  'image/bmp',
]);

export async function convertProductImageToWebp(file) {
  if (file.type === 'image/webp') return file;
  if (!CONVERTIBLE_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choisissez une image JPEG, PNG, GIF, AVIF, BMP ou WebP.');
  }
  if (typeof createImageBitmap !== 'function') {
    throw new Error('La conversion d’image n’est pas prise en charge par ce navigateur.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Impossible de préparer cette image.');

    context.drawImage(bitmap, 0, 0);
    const webpBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('La conversion de l’image en WebP a échoué.'));
      }, 'image/webp', 0.88);
    });
    if (webpBlob.type !== 'image/webp') {
      throw new Error('Ce navigateur ne peut pas encoder les images en WebP.');
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'produit';
    return new File([webpBlob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    bitmap?.close();
  }
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Impossible de lire cette image.'));
    };
    reader.onerror = () => reject(new Error('Impossible de lire cette image.'));
    reader.readAsDataURL(file);
  });
}
