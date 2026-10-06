import api from '../../services/api';
import { createAsyncResourceCache } from './asyncResourceCache';

const CACHE_DURATION_MS = 30_000;

const productsCache = createAsyncResourceCache(() => api.get('/admin/products', {
  params: { per_page: 60 },
}).then((response) => response.data.data || []), CACHE_DURATION_MS);

export function getCachedAdminProducts() {
  return productsCache.getCached();
}

export function getAdminProducts() {
  return productsCache.get();
}

export function invalidateAdminProductsCache() {
  productsCache.invalidate();
}
