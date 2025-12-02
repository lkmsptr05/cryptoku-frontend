// src/hooks/useGasEstimate.js
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

/**
 * useGasEstimate
 * - networkKey: backend network key (eg "ethereum", "ton")
 * - to: destination address
 * - tokenAddress: optional contract address
 * - enabled: boolean
 * - opts: { pollingMs, debounceMs }
 */
export default function useGasEstimate({
  networkKey,
  to,
  tokenAddress,
  enabled = true,
  opts = {},
}) {
  const pollingMs = typeof opts.pollingMs === "number" ? opts.pollingMs : 10000;
  const debounceMs =
    typeof opts.debounceMs === "number" ? opts.debounceMs : 300;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!enabled || !networkKey || !to) {
      setData(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    const paramsKey = `${networkKey}|${to}|${tokenAddress || ""}`;

    const fetchOnce = async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      setLoading(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams({ network_key: networkKey, to });
        if (tokenAddress) params.append("tokenAddress", tokenAddress);
        const url = `${API_BASE_URL}/gas/estimate?${params.toString()}`;

        const resp = await fetch(url, { signal: abortRef.current.signal });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => null);
          throw new Error(txt || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        setData(json);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("useGasEstimate error:", err);
        setErrorMsg(err.message || "Failed to fetch gas estimate");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    const schedule = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchOnce();
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(fetchOnce, pollingMs);
      }, debounceMs);
    };

    schedule();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkKey, to, tokenAddress, enabled, pollingMs, debounceMs]);

  return { data, loading, errorMsg };
}
