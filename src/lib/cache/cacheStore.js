// src/lib/cache/cacheStore.js

const cache = new Map();

/*
  cache structure:
  key => {
      data,
      error,
      timestamp,
      ttl,
      promise
  }
*/

export function getCache(key) {
  return cache.get(key) || null;
}

export function setCache(key, value) {
  cache.set(key, value);
}

export function removeCache(key) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}

export function isCacheFresh(entry) {
  if (!entry) return false;
  if (!entry.timestamp || !entry.ttl) return false;

  return Date.now() - entry.timestamp < entry.ttl;
}
