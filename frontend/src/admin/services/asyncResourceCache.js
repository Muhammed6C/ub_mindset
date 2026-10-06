export function createAsyncResourceCache(fetchResource, durationMs) {
  let cachedValue;
  let hasCachedValue = false;
  let expiresAt = 0;
  let pendingRequest = null;
  let generation = 0;

  return {
    getCached() {
      return hasCachedValue ? cachedValue : undefined;
    },

    get() {
      if (hasCachedValue && Date.now() < expiresAt) {
        return Promise.resolve(cachedValue);
      }
      if (pendingRequest) return pendingRequest;

      const requestGeneration = generation;
      let request;
      request = Promise.resolve()
        .then(fetchResource)
        .then((value) => {
          if (requestGeneration === generation) {
            cachedValue = value;
            hasCachedValue = true;
            expiresAt = Date.now() + durationMs;
          }
          if (pendingRequest === request) pendingRequest = null;
          return value;
        }, (error) => {
          if (pendingRequest === request) pendingRequest = null;
          throw error;
        });
      pendingRequest = request;
      return request;
    },

    invalidate() {
      generation += 1;
      pendingRequest = null;
      cachedValue = undefined;
      hasCachedValue = false;
      expiresAt = 0;
    },
  };
}
