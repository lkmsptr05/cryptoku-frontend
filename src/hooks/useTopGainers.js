// src/hooks/useTopGainers.js
import { useQuery } from "./useQuery";
import { getAllPrices } from "../services/api";
import { useMemo } from "react";

export default function useTopGainers(limit = 3) {
  const { data, loading, error, refetch } = useQuery({
    key: "prices",
    fetcher: getAllPrices,
    ttl: 5000,
    initialData: [],
  });

  const gainers = useMemo(() => {
    const arr = Array.isArray(data) ? data : data?.data || [];

    return [...arr]
      .filter(
        (t) =>
          t.priceChangePercent !== undefined && t.priceChangePercent !== null
      )
      .map((t) => ({
        ...t,
        priceChangePercent: Number(t.priceChangePercent),
      }))
      .filter((t) => !Number.isNaN(t.priceChangePercent))
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, limit);
  }, [data, limit]);

  return {
    gainers,
    loading,
    error,
    refetch,
  };
}
