// src/hooks/useMutation.js
import { useState } from "react";
import { removeCache } from "../lib/cache/cacheStore";
import { removeFromStorage } from "../lib/cache/persist";

export function useMutation(mutationFn, options = {}) {
  const { invalidate = [] } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutate(payload) {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFn(payload);

      invalidate.forEach((key) => {
        removeCache(key);
        removeFromStorage(key);
      });

      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    mutate,
    loading,
    error,
  };
}
