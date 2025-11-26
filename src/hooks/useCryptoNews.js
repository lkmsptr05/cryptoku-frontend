// src/hooks/useCryptoNews.js
import { useQuery } from "./useQuery";
import { getCryptoNews } from "../services/api";

export default function useCryptoNews() {
  const { data, loading, error, refetch } = useQuery({
    key: "crypto-news",
    fetcher: getCryptoNews,
    ttl: 60_000,
    initialData: [],
  });

  const news = Array.isArray(data) ? data : data?.data || data?.items || [];

  return {
    news,
    loading,
    error,
    refetch,
  };
}
