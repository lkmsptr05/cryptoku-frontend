// src/hooks/useEthMovement.js
import { useEffect, useState } from "react";
import { getPrice } from "../services/api";

export default function useEthMovement() {
  const [movement, setMovement] = useState("...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchEth() {
      try {
        setLoading(true);

        const price = await getPrice("ethusdt");
        const change = Number(price.priceChangePercent) || 0;

        let movementStatus = "";
        if (change > 0) {
          movementStatus = `naik +${change.toFixed(2)}`;
        } else if (change < 0) {
          movementStatus = `turun ${change.toFixed(2)}`;
        } else {
          movementStatus = `stabil ${change.toFixed(2)}`;
        }

        if (!cancelled) {
          setMovement(movementStatus);
        }
      } catch (error) {
        console.error("Gagal mengambil data ETH:", error);
        if (!cancelled) {
          setMovement("perubahan tidak diketahui");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEth();

    // optional: auto refresh tiap 60 detik
    const id = setInterval(fetchEth, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return {
    movement,
    loading,
  };
}
