export function getAdminImage(src) {
  return src.replace('/assets/', '/assets/admin-').replace(/\.png$/i, '.webp');
}
