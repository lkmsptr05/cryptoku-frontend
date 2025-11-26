// src/hooks/useSparkline.js
import { useEffect, useState } from "react";
import { getSparkline } from "../services/api";

// Global in-memory cache (per symbol)
const sparklineCache = new Map();

// 60 detik cache
const TTL = 60 * 1000;

export default function useSparkline(symbol) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(!!symbol);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    const key = symbol.toLowerCase();

    async function load() {
      setError(null);

      // 1. Cek cache dulu
      const cached = sparklineCache.get(key);

      if (cached && Date.now() - cached.timestamp < TTL) {
        setPoints(cached.points || []);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 2. Fetch baru kalau ga ada / expired
        const data = await getSparkline(key);
        const finalPoints = Array.isArray(data?.points)
          ? data.points
          : Array.isArray(data)
          ? data
          : [];

        if (cancelled) return;

        // 3. Simpan ke cache
        sparklineCache.set(key, {
          points: finalPoints,
          timestamp: Date.now(),
        });

        setPoints(finalPoints);
      } catch (err) {
        if (!cancelled) {
          console.error("useSparkline error:", err);
          setError(err.message || "Sparkline error");
          setPoints([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return {
    points,
    loading,
    error,
  };
}
