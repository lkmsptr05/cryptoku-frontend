// src/hooks/useQuery.js
import { useEffect, useState, useRef } from "react";
import { getCache, setCache, isCacheFresh } from "../lib/cache/cacheStore";
import { saveToStorage, loadFromStorage } from "../lib/cache/persist";

export function useQuery({
  key,
  fetcher,
  enabled = true,
  ttl = 15000,
  initialData = null,
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const keyRef = useRef(key);

  useEffect(() => {
    if (!enabled) return;

    const cached = getCache(key);
    const valid = cached && isCacheFresh(cached);

    // 1. load from memory
    if (valid) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // 2. load from localStorage
    const stored = loadFromStorage(key);
    if (stored && isCacheFresh(stored)) {
      setCache(key, stored);
      setData(stored.data);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const promise =
      cached?.promise ||
      fetcher().then((res) => {
        // auto detect: {success, data}
        if (res?.data !== undefined) return res.data;
        return res;
      });

    setCache(key, {
      ...cached,
      promise,
      ttl,
    });

    setLoading(true);

    promise
      .then((result) => {
        if (cancelled) return;

        const entry = {
          data: result,
          error: null,
          timestamp: Date.now(),
          ttl,
          promise: null,
        };

        setCache(key, entry);
        saveToStorage(key, entry);

        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, fetcher, enabled, ttl]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    setCache(keyRef.current, null);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
