// src/hooks/useMarketPrices.js
import { useEffect, useState } from "react";
import { getAllPrices } from "../services/api";

const CACHE_KEY = "market_cache_v1";
const CACHE_TTL = 10_000; // 10 detik

export default function useMarketPrices() {
  const [prices, setPrices] = useState([]);
  const [previousPrices, setPreviousPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchPrices = async (force = false) => {
    setError(null);

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);

      if (!force && cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setPreviousPrices(parsed.previous || []);
            setPrices(parsed.data || []);
            setLastUpdated(parsed.timestamp);
            setLoading(false);
            setIsRefreshing(false);
            return;
          }
        } catch {
          // ignore parse error
        }
      }

      const data = await getAllPrices();
      const arr = Array.isArray(data) ? data : data?.data || [];

      const withSpark = arr.map((x) => ({
        ...x,
        price_usd: Number(x.price_usd) || 0,
        price_idr: Number(x.price_idr) || 0,
        priceChangePercent: Number(x.priceChangePercent) || 0,
      }));

      const save = {
        data: withSpark,
        previous: prices,
        timestamp: Date.now(),
      };

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(save));
      } catch {
        // ignore storage error
      }

      setPreviousPrices(prices);
      setPrices(withSpark);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("fetchPrices error:", err);
      setError("Gagal memuat harga, periksa koneksi.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(() => fetchPrices(true), 20_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // urutkan sama seperti di Market.jsx sekarang
  const sortedByPrice = prices
    .slice()
    .sort((a, b) => Number(b.price_usd) - Number(a.price_usd));

  const availableItems = sortedByPrice.filter(
    (item) => item.status === "available"
  );
  const unavailableItems = sortedByPrice.filter(
    (item) => item.status !== "available"
  );
  const sorted = [...availableItems, ...unavailableItems];

  return {
    prices: sorted,
    previousPrices,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: fetchPrices,
  };
}
