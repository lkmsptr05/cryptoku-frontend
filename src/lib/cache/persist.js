// src/lib/cache/persist.js

const PREFIX = "cryptoku_cache_";

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn("Cache storage full:", e);
  }
}

export function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(PREFIX + key);
}
