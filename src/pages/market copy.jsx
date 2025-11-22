import React, { useState, useEffect, useRef } from "react";
import { getAllPrices } from "../services/api";
import { ArrowUp, ArrowDown, RefreshCcw } from "lucide-react";
import { Sparklines, SparklinesLine } from "react-sparklines";

// =============== Helper ===================
const formatSymbol = (s) =>
  s.toUpperCase().replace(/(USDT|USDC|BUSD)$/i, "");

const formatPrice = (price, currency = "USD") => {
  const p = parseFloat(price);
  if (isNaN(p)) return "N/A";

  if (currency === "IDR") {
    return p.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  }

  return p.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: p < 1 ? 8 : 2,
  });
};

// =============== Animated Number ===================
const useAnimatedNumber = (value, duration = 400) => {
  const [v, setV] = useState(value);

  useEffect(() => {
    const start = v;
    const end = value;
    const startTime = performance.now();

    const animate = (t) => {
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setV(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return v;
};

// =============== Price Item ===================
const PriceItem = ({ item, previous }) => {
  const change = parseFloat(item.priceChangePercent);
  const positive = change > 0;
  const negative = change < 0;

  const lastPrice = previous?.price_usd;
  const currentPrice = item.price_usd;

  const priceUp = lastPrice && currentPrice > lastPrice;
  const priceDown = lastPrice && currentPrice < lastPrice;

  const animatedPrice = useAnimatedNumber(parseFloat(currentPrice));
  const flashRef = useRef(null);

  useEffect(() => {
    if (!flashRef.current) return;

    const cls = priceUp
      ? "bg-green-500/20"
      : priceDown
      ? "bg-red-500/20"
      : null;

    if (cls) {
      flashRef.current.classList.add(cls);
      setTimeout(() => flashRef.current.classList.remove(cls), 350);
    }
  }, [currentPrice]);

  return (
    <div
      ref={flashRef}
      className="
        transition-all duration-300 flex items-center justify-between
        bg-zinc-800/40 dark:bg-white/5 
        backdrop-blur-md p-4 rounded-2xl
        border border-zinc-700 dark:border-white/10
        hover:border-zinc-500 hover:scale-[1.01]
      "
    >
      {/* LEFT */}
      <div className="flex flex-col w-1/3">
        <p className="text-white font-semibold text-lg uppercase tracking-wide">
          {formatSymbol(item.symbol)}/USDT
        </p>
        <p className="text-zinc-400 text-sm mt-1">
          {formatPrice(item.price_idr, "IDR")}
        </p>
      </div>

      {/* MID — Sparkline */}
      <div className="w-1/3 flex justify-center">
        <div className="w-24 relative">
          <div className="absolute -inset-1 bg-blue-500/10 dark:bg-cyan-400/10 blur-lg rounded-xl animate-pulse"></div>
          <Sparklines data={item.sparkline || []}>
            <SparklinesLine style={{ strokeWidth: 3, fill: "none" }} />
          </Sparklines>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-end w-1/3">
        <p className="text-white font-bold text-lg">
          {formatPrice(animatedPrice)}
        </p>

        <p
          className={`flex items-center text-sm font-medium mt-1 ${
            positive
              ? "text-green-400"
              : negative
              ? "text-red-400"
              : "text-zinc-400"
          }`}
        >
          {positive && <ArrowUp className="w-4 h-4 mr-1" />}
          {negative && <ArrowDown className="w-4 h-4 mr-1" />}
          {!positive && !negative && <span className="mr-1">-</span>}
          {Math.abs(change).toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

// =============== Market Page ===================
export default function Market() {
  const [prices, setPrices] = useState([]);
  const [previousPrices, setPreviousPrices] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchPrices = async () => {
    try {
      const data = await getAllPrices();

      // Generate fake sparkline
      const withSpark = data.map((x) => ({
        ...x,
        sparkline: Array.from({ length: 15 }, () =>
          (parseFloat(x.price_usd) * (0.97 + Math.random() * 0.06)).toFixed(4)
        ),
      }));

      setPreviousPrices(prices);
      setPrices(withSpark);
      setLastUpdated(Date.now());
    } catch (err) {
      setError("Gagal memuat harga crypto.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black dark:from-black dark:to-black text-white pb-28">
      <header className="px-6 pt-6 pb-4 border-b border-zinc-800 dark:border-white/10 bg-zinc-900/60 dark:bg-black/40 backdrop-blur-lg sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Market
            <span className="
              ml-2 px-3 py-1 rounded-xl text-xs font-semibold
              bg-white/5 dark:bg-white/5 backdrop-blur-xl
              text-white border border-white/10
              shadow-[0_0_15px_rgba(255,255,255,0.2)]
            ">
              AMOLED PRO
            </span>
          </h1>

          <p className="text-zinc-400 text-xs mt-1">
            Harga crypto real-time
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            Diperbarui: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </header>

      <main className="px-6 py-6 space-y-4">
        {initialLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-xl text-center">
            {error}
          </div>
        )}

        {!initialLoading && !error && prices.length > 0 && (
          <div className="space-y-3">
            {prices
              .slice()
              .sort((a, b) => parseFloat(b.price_usd) - parseFloat(a.price_usd))
              .map((item, i) => (
                <PriceItem
                  key={i}
                  item={item}
                  previous={previousPrices.find((p) => p.symbol === item.symbol)}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
