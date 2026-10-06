import test from 'node:test';
import assert from 'node:assert/strict';
import { createAsyncResourceCache } from './asyncResourceCache.js';

test('deduplicates concurrent loads and returns fresh cached values', async () => {
  let calls = 0;
  const cache = createAsyncResourceCache(async () => {
    calls += 1;
    return ['product'];
  }, 60_000);

  const first = cache.get();
  const second = cache.get();

  assert.strictEqual(first, second);
  assert.deepEqual(await first, ['product']);
  assert.deepEqual(await cache.get(), ['product']);
  assert.equal(calls, 1);
});

test('keeps stale data available while revalidating it', async () => {
  let resolveRefresh;
  let calls = 0;
  const cache = createAsyncResourceCache(() => {
    calls += 1;
    if (calls === 1) return Promise.resolve(['old']);
    return new Promise((resolve) => { resolveRefresh = resolve; });
  }, 0);

  await cache.get();
  const refresh = cache.get();

  assert.deepEqual(cache.getCached(), ['old']);
  await Promise.resolve();
  resolveRefresh(['new']);
  assert.deepEqual(await refresh, ['new']);
  assert.deepEqual(cache.getCached(), ['new']);
});

test('does not restore an invalidated request after it resolves', async () => {
  let resolveOldRequest;
  const cache = createAsyncResourceCache(
    () => new Promise((resolve) => { resolveOldRequest = resolve; }),
    60_000,
  );
  const oldRequest = cache.get();

  await Promise.resolve();
  cache.invalidate();
  resolveOldRequest(['stale']);
  await oldRequest;

  assert.equal(cache.getCached(), undefined);
});
