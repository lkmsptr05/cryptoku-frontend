// src/hooks/useMarketIndex.js
import { useQuery } from "./useQuery";
import { getAllPrices } from "../services/api";

function calculateIndexFromPrices(arr = []) {
  if (!arr || arr.length === 0) {
    return {
      index: 0,
      sentiment: "Neutral",
      style:
        "inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-[2px] text-[10px] text-zinc-400 border border-zinc-500/30",
      arrow: "",
      animate: "h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse",
      color: "text-zinc-400",
    };
  }

  const total = arr.reduce(
    (acc, c) => acc + Number(c.priceChangePercent || 0),
    0
  );

  const index = total / arr.length;

  let sentiment = "Neutral";
  let arrow = "";
  let animate = "h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse";
  let color = "text-zinc-400";
  let style =
    "inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-[2px] text-[10px] text-zinc-400 border border-zinc-500/30";

  if (index > 1) {
    sentiment = "Bullish";
    arrow = "▲";
    color = "text-emerald-400";
    style =
      "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] text-emerald-400 border border-emerald-500/30";
    animate = "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse";
  } else if (index < -1) {
    sentiment = "Bearish";
    arrow = "▼";
    color = "text-red-400";
    style =
      "inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-[2px] text-[10px] text-red-400 border border-red-500/30";
    animate = "h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse";
  }

  return {
    index: Number(index.toFixed(2)),
    sentiment,
    style,
    arrow,
    animate,
    color,
  };
}

export default function useMarketIndex() {
  const { data, loading, error } = useQuery({
    key: "prices",
    fetcher: getAllPrices,
    ttl: 5000,
    initialData: [],
  });

  const indexData = calculateIndexFromPrices(
    Array.isArray(data) ? data : data?.data || []
  );

  return {
    marketIndex: indexData,
    loading,
    error,
  };
}
