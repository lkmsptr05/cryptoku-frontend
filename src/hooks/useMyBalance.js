// src/hooks/useMyBalance.js
import { useQuery } from "./useQuery";
import { getMyBalance } from "../services/api";

export default function useMyBalance(userId) {
  const { data, loading, error, refetch } = useQuery({
    key: userId ? `balance:${userId}` : "balance:none",
    fetcher: () => getMyBalance(userId),
    enabled: !!userId, // cuma jalan kalau sudah ada telegramUser.id
    ttl: 10_000, // 10 detik sudah cukup untuk saldo
    initialData: 0,
  });

  return {
    balance: data ?? 0,
    loading,
    error,
    refetch,
  };
}
