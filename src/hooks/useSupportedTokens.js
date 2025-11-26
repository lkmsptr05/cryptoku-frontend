// src/hooks/useSupportedTokens.js
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const TOKENS_API = `${API_BASE_URL}/supported-tokens`;
/**
 * Response backend:
 * {
 *   success: boolean,
 *   data: [
 *     {
 *       id,
 *       network_key,
 *       symbol,
 *       contract_address,
 *       decimals,
 *       is_active,
 *       ...
 *     }
 *   ]
 * }
 */
export function useSupportedTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let aborted = false;

    const fetchTokens = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(TOKENS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error("API not success");

        if (!aborted) {
          const activeTokens = (json.data || []).filter((t) => t.is_active);
          setTokens(activeTokens);
        }
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
        if (!aborted) setErrorMsg(err.message || "Failed to fetch tokens");
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchTokens();

    return () => {
      aborted = true;
    };
  }, []);

  return { tokens, loading, errorMsg };
}
