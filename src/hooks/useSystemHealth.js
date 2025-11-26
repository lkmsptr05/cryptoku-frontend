// src/hooks/useSystemHealth.js
import { useQuery } from "./useQuery";
import { getSystemHealth } from "../services/api";

export default function useSystemHealth() {
  const { data, loading, error, refetch } = useQuery({
    key: "system-health",
    fetcher: getSystemHealth,
    ttl: 30_000,
  });

  return {
    health: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
  };
}
