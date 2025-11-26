// src/hooks/useMarketSupportedTokens.js
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

export default function useMarketSupportedTokens() {
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [tokensError, setTokensError] = useState(null);

  useEffect(() => {
    let aborted = false;

    async function fetchSupportedTokens() {
      try {
        setTokensLoading(true);
        setTokensError(null);

        const res = await fetch(`${API_BASE_URL}/tokens`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error("API tidak success");

        const activeTokens = (json.data || []).filter((t) => t.is_active);
        if (!aborted) {
          setSupportedTokens(activeTokens);
        }
      } catch (err) {
        console.error("fetchSupportedTokens error:", err);
        if (!aborted) {
          setTokensError("Gagal memuat daftar token yang tersedia.");
        }
      } finally {
        if (!aborted) {
          setTokensLoading(false);
        }
      }
    }

    fetchSupportedTokens();
    return () => {
      aborted = true;
    };
  }, []);

  return {
    supportedTokens,
    tokensLoading,
    tokensError,
  };
}
