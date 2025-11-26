// src/hooks/usePrices.js
import { useMemo } from "react";
import { useQuery } from "./useQuery";
import { getAllPrices } from "../services/api";

export function useAllPrices() {
  const { data, loading, error, refetch } = useQuery({
    key: "prices",
    fetcher: getAllPrices, // balikin array prices langsung
    ttl: 5_000, // 5 detik cukup, ini data lumayan dinamis
    initialData: [],
  });

  return {
    prices: data || [],
    loading,
    error,
    refetch,
  };
}

export function useTopGainers(limit = 5) {
  const { prices, loading, error, refetch } = useAllPrices();

  const topGainers = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    return [...prices]
      .filter(
        (p) =>
          typeof p.priceChangePercent === "number" &&
          !Number.isNaN(p.priceChangePercent)
      )
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, limit);
  }, [prices, limit]);

  return {
    topGainers,
    loading,
    error,
    refetch,
  };
}
