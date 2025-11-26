// src/hooks/useGasEstimate.js
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
const API_BASE = `${API_BASE_URL}/estimate-gas`;

/**
 * params:
 * - networkKey: string (mis: "ethereum", "bsc")
 * - to: string (address tujuan)
 * - tokenAddress?: string (kalau native, jangan dikirim)
 * - enabled?: boolean
 */
export function useGasEstimate({
  networkKey,
  to,
  tokenAddress,
  enabled = true,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!enabled || !networkKey || !to) return;

    let intervalId;

    const fetchGas = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const params = new URLSearchParams({
          network_key: networkKey,
          to,
        });

        if (tokenAddress) {
          params.append("tokenAddress", tokenAddress);
        }

        const res = await fetch(`${API_BASE}?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch gas estimate:", err);
        setErrorMsg(err.message || "Failed to fetch gas estimate");
      } finally {
        setLoading(false);
      }
    };

    // fetch pertama
    fetchGas();
    // lalu polling tiap 10 detik
    intervalId = window.setInterval(fetchGas, 10_000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [networkKey, to, tokenAddress, enabled]);

  return { data, loading, errorMsg };
}
