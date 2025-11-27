// ===============================
// src/pages/Market.jsx
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import SparklineMini from "../components/SparklineMini";

import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import { useNavigate } from "react-router-dom";
import BannerBox from "../components/BannerBox";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import useMarketPrices from "../hooks/useMarketPrices";
import useEthMovement from "../hooks/useEthMovement";
import useMarketSupportedTokens from "../hooks/useMarketSupportedTokens";
import MarketRowSkeleton from "../components/skeleton/MarketRowSkeleton";

import toast from "react-hot-toast";

/* -------------------- Constants -------------------- */
// const TOKENS_API = "https://cryptoku-backend-beige.vercel.app/api/tokens";

/* -------------------- Helpers -------------------- */

const formatSymbol = (s) =>
  s
    ? s.toUpperCase().replace(/(USDT|USDC|BUSD|USD)$/i, "") // tambahin USD
    : "";

const formatPrice = (price, currency = "USD") => {
  const n = parseFloat(price);
  if (!isFinite(n)) return "N/A";

  if (currency === "IDR")
    return n.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 8 : 2,
  });
};
const getPairParts = (symbol) => {
  const up = (symbol || "").toUpperCase();
  const m = up.match(/(USDT|USDC|BUSD|USD)$/);
  if (!m) return { base: up, quote: "" };
  const quote = m[1];
  const base = up.slice(0, -quote.length);
  return { base, quote };
};

const useAnimatedNumber = (value, duration = 400) => {
  const [v, setV] = useState(Number(value) || 0);

  useEffect(() => {
    let raf = null;
    const start = v;
    const end = Number(value) || 0;
    const t0 = performance.now();

    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return v;
};

const formatTime = (ts) => {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "-";
  }
};

/* -------------------- PriceItem -------------------- */
function PriceItem({ item, previous, amoled, translateForItem = 0, onClick }) {
  const change = Number(item.priceChangePercent) || 0;
  const positive = change > 0;
  const negative = change < 0;
  const { base, quote } = getPairParts(item.symbol);
  const last = previous?.price_usd;
  const current = Number(item.price_usd) || 0;

  const up = last && current > last;
  const down = last && current < last;

  const animatedPrice = useAnimatedNumber(current);
  const refFlash = useRef(null);

  useEffect(() => {
    if (!refFlash.current) return;
    const cls = up ? "bg-emerald-500/10" : down ? "bg-red-500/10" : null;
    if (cls) {
      refFlash.current.classList.add(cls);
      const t = setTimeout(() => refFlash.current?.classList.remove(cls), 380);
      return () => clearTimeout(t);
    }
  }, [current, up, down]);

  return (
    <button
      type="button"
      onClick={onClick}
      ref={refFlash}
      style={{
        transform: `translateY(${translateForItem}px)`,
        transition: "transform 0.22s cubic-bezier(.2,.9,.2,1)",
      }}
      className={`
        w-full text-left
        transition-colors duration-300 p-4 rounded-2xl border
        ${
          amoled
            ? "bg-black/40 border-zinc-800"
            : "bg-zinc-900/75 border-zinc-800"
        }
        active:scale-[0.99]
      `}
    >
      <div className="flex items-center justify-between gap-3">
        {/* LEFT: symbol + IDR */}
        <div>
          <div className="min-w-[110px]">
            <div className="text-white font-semibold text-sm">
              {base}/{quote || "USDT"}
            </div>

            <div className="text-zinc-400 text-xs mt-1">
              {formatPrice(item.price_idr, "IDR")}
            </div>

            {/* placeholder agar tinggi stabil */}
            {/* <div className="text-[10px] mt-1 min-h-[14px]">
              {!isSupported && (
                <div className="absolute bottom-2 left-2 text-[10px] px-2 py-[2px] rounded-full bg-amber-500/20 text-amber-400">
                  Coming Soon
                </div>
              )}
            </div> */}
          </div>
        </div>

        {/* MIDDLE: sparkline */}
        <SparklineMini
          symbol={item.symbol}
          positive={positive}
          negative={negative}
        />

        {/* RIGHT: USD + % */}
        <div className="text-right min-w-[90px]">
          <div className="text-white font-bold text-sm">
            {formatPrice(animatedPrice)}
          </div>

          <div
            className={`text-xs mt-1 inline-flex items-center gap-1 px-2 py-[2px] rounded-full border ${
              positive
                ? "text-emerald-400 border-emerald-400/40 bg-emerald-500/5"
                : negative
                ? "text-red-400 border-red-400/40 bg-red-500/5"
                : "text-zinc-400 border-zinc-600/60 bg-zinc-800/40"
            }`}
          >
            {positive && <ArrowUp className="w-3.5 h-3.5" />}
            {negative && <ArrowDown className="w-3.5 h-3.5" />}
            <span>
              {positive ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* -------------------- MAIN Market.jsx -------------------- */
export default function Market() {
  const { amoled, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsBadge();
  const {
    prices: sorted,
    previousPrices,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useMarketPrices();

  const {
    supportedTokens,
    tokensLoading, // kalau mau dipakai lagi nanti
    tokensError,
  } = useMarketSupportedTokens();

  const { movement: ethMovement, loading: ethLoading } = useEthMovement();
  const titleText = ethLoading
    ? "ETH bergerak..."
    : `ETH bergerak ${ethMovement} hari ini`;
  // Floating header state (match Home)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // pull-to-refresh
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullY = useRef(0);

  const [pullProgress, setPullProgress] = useState(0);
  const [baseTranslate, setBaseTranslate] = useState(0);

  /* -------------------- Pull-to-refresh -------------------- */
  const onTouchStart = (e) => {
    if (window.scrollY !== 0) return;
    pulling.current = true;
    startY.current = e.touches[0].clientY;
    pullY.current = 0;
  };

  const onTouchMove = (e) => {
    if (!pulling.current) return;

    const y = e.touches[0].clientY;
    pullY.current = y - startY.current;

    if (pullY.current < 0) pullY.current = 0;

    const maxPull = 180;
    const softLimit = 110;

    const elastic = maxPull * (1 - Math.exp(-pullY.current / maxPull));
    const progress = Math.min(elastic / softLimit, 1);
    setPullProgress(progress);

    const damping = 1 - elastic / (maxPull * 1.05);
    const base = elastic * 0.85 * Math.max(0.12, damping);

    setBaseTranslate(base);
  };

  const onTouchEnd = () => {
    if (!pulling.current) return;
    pulling.current = false;

    setPullProgress(0);
    setBaseTranslate(0);
  };

  const computeItemTranslate = (i, total, base) => {
    const dropPerIndex = 0.06;
    const sensitivity = Math.max(0.12, 1 - i * dropPerIndex);
    const lengthFactor = Math.max(0.5, 1 - total / 80);
    return Math.round(base * sensitivity * lengthFactor);
  };
  const total = sorted.length;

  /* -------------------- Floating header scroll logic (match Home) -------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;

      if (currentY < 16) {
        setShowHeader(true);
        lastScrollY.current = currentY;
        return;
      }

      const diff = currentY - lastScrollY.current;

      if (diff > 4 && currentY > 40) {
        setShowHeader(false);
      } else if (diff < -4) {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSelectToken(item) {
    const supported = isItemSupported(item);

    if (!supported) {
      toast("🚧 Token ini belum tersedia", {
        style: {
          background: "#111",
          color: "#fff",
          border: "1px solid #27272a",
        },
      });
      return;
    }

    navigate(`/order/${item.symbol}`, {
      state: {
        token: item, // seluruh object item
      },
    });
  }

  // helper: cek apakah suatu item market tersedia di daftar token jual
  const isItemSupported = (item) => {
    const baseSymbol = formatSymbol(item.symbol); // contoh: BTCUSDT -> BTC
    if (!baseSymbol) return false;
    return supportedTokens.some(
      (t) => String(t.symbol).toUpperCase() === baseSymbol
    );
  };

  const firstUnavailableIndex = sorted.findIndex(
    (item) => item.status !== "available"
  );

  return (
    <div
      className={`min-h-screen px-4 pt-16 pb-32 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-950 to-black"
      } text-white`}
    >
      {/* ===========================
          FLOATING GLOBAL HEADER (match Home)
      ============================ */}
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full mx-auto pointer-events-auto">
          <div
            className={`
              rounded-b-lg px-5 border
              backdrop-blur-md
              shadow-md
              ${
                amoled
                  ? "bg-black/85 border-zinc-900"
                  : "bg-zinc-900/85 border-zinc-800"
              }
            `}
            style={{
              transform: showHeader ? "translateY(0)" : "translateY(-100%)",
              opacity: showHeader ? 1 : 0,
              transition: "transform 0.35s ease, opacity 0.5s ease",
            }}
          >
            <GlobalHeader
              title="Market"
              subtitle="Harga crypto real-time"
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>

      {/* ===========================
          PAGE CONTENT
      ============================ */}
      <div className="max-w-md pt-2 mx-auto">
        <BannerBox
          label="Market Update"
          // Gunakan nilai dari state yang sudah diselesaikan
          title={titleText}
          description="Pantau market dan ambil peluang trading terbaik."
          accent="emerald"
        />

        {/* Info bar: last updated */}
        <div className="flex items-center pt-4 justify-between text-[11px] text-zinc-500 mb-3 mt-1">
          <span>Harga Market</span>
          <span>Update: {formatTime(lastUpdated)}</span>
        </div>

        {/* Pull-to-refresh indicator */}
        <div
          aria-hidden
          style={{
            height:
              pullProgress > 0 || isRefreshing
                ? Math.max(32, pullProgress * 64)
                : 0,
            transition: pulling.current
              ? "none"
              : "height 260ms cubic-bezier(.2,.9,.2,1)",
          }}
          className="overflow-hidden flex items-center justify-center"
        >
          {(pullProgress > 0 || isRefreshing) && (
            <div className="flex flex-col items-center">
              <div
                style={{
                  transform: `scale(${0.6 + pullProgress * 0.9})`,
                  transition: pulling.current ? "none" : "transform 220ms ease",
                }}
                className="w-6 h-6 rounded-full border-4 border-emerald-400 border-t-transparent"
              >
                <div
                  className={`w-full h-full ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </div>

              <p className="text-xs mt-1 text-zinc-300">
                {isRefreshing
                  ? "Menyegarkan data..."
                  : pullProgress < 1
                  ? "Tarik ke bawah untuk refresh..."
                  : "Lepas untuk refresh"}
              </p>
            </div>
          )}
        </div>

        {/* List */}
        <main
          className="space-y-3"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          style={{
            transition: pulling.current
              ? "none"
              : "transform 260ms cubic-bezier(.2,.9,.2,1)",
            transform: `translateY(${baseTranslate}px)`,
          }}
        >
          {/* LOADING */}
          {loading && !error && (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <MarketRowSkeleton key={i} amoled={amoled} />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <p className="mt-4 text-sm text-amber-400">{error}</p>
          )}

          {/* DATA */}
          {!loading && !error && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((item, i) => {
                const isSupported =
                  item.status === "available" && isItemSupported(item);

                return (
                  <React.Fragment key={item.symbol || i}>
                    {/* ✅ MISAHKAN AREA AVAILABLE & UNAVAILABLE */}
                    {i === firstUnavailableIndex &&
                      firstUnavailableIndex !== -1 && (
                        <div className="py-4 flex items-center gap-4">
                          <div className="flex-1 h-px bg-zinc-800" />
                          <span className="text-xs text-zinc-500 tracking-wide">
                            Coming Soon
                          </span>
                          <div className="flex-1 h-px bg-zinc-800" />
                        </div>
                      )}

                    <PriceItem
                      item={item}
                      previous={previousPrices.find(
                        (p) => p.symbol === item.symbol
                      )}
                      amoled={amoled}
                      translateForItem={computeItemTranslate(
                        i,
                        total,
                        baseTranslate
                      )}
                      isSupported={isSupported}
                      onClick={() => handleSelectToken(item)}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
