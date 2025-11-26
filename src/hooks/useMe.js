// src/hooks/useMe.js
import { useQuery } from "./useQuery";
import { getMe } from "../services/api";

export default function useMe() {
  const { data, loading, error, refetch } = useQuery({
    key: "me",
    fetcher: getMe, // getMe sudah pakai request.js + initData
    ttl: 30_000, // 30 detik cache
  });

  // data dari getMe bentuknya: { user, balance, wallets }
  return {
    me: data || null,
    loading,
    error,
    refetch,
  };
}
