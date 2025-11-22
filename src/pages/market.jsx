// ===============================
// src/pages/Market.jsx
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { getAllPrices } from "../services/api";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import { useNavigate } from "react-router-dom";
import BannerBox from "../components/BannerBox"

/* -------------------- Helpers -------------------- */
const formatSymbol = (s) =>
  s ? s.toUpperCase().replace(/(USDT|USDC|BUSD)$/i, "") : "";

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
          <div className="text-white font-semibold text-sm">
            {formatSymbol(item.symbol)}/USDT
          </div>
          <div className="text-zinc-400 text-xs mt-1">
            {formatPrice(item.price_idr, "IDR")}
          </div>
        </div>

        {/* MIDDLE: sparkline */}
        <div className="w-28 sm:w-32">
          <Sparklines
            data={item.sparkline || []}
            width={100}
            height={30}
            margin={4}
          >
            <SparklinesLine
              style={{
                strokeWidth: 2.2,
                fill: "none",
                stroke:
                  positive
                    ? "rgb(52,211,153)"
                    : negative
                    ? "rgb(248,113,113)"
                    : "rgb(148,163,184)",
              }}
            />
          </Sparklines>
        </div>

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
            <span>{positive ? "+" : ""}{change.toFixed(2)}%</span>
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

  const [prices, setPrices] = useState([]);
  const [previousPrices, setPreviousPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Floating header state (match Home)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // pull-to-refresh
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullY = useRef(0);

  const [pullProgress, setPullProgress] = useState(0);
  const [baseTranslate, setBaseTranslate] = useState(0);

  const CACHE_KEY = "market_cache_v1";
  const CACHE_TTL = 10000;

  const fetchPrices = async (force = false) => {
    setError(null);

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);

      if (!force && cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setPreviousPrices(parsed.previous || []);
            setPrices(parsed.data || []);
            setLastUpdated(parsed.timestamp);
            setLoading(false);
            setIsRefreshing(false);
            return;
          }
        } catch {
          // ignore parse error
        }
      }

      const data = await getAllPrices();
      const arr = Array.isArray(data) ? data : data?.data || [];

      const withSpark = arr.map((x) => ({
        ...x,
        price_usd: Number(x.price_usd) || 0,
        price_idr: Number(x.price_idr) || 0,
        priceChangePercent: Number(x.priceChangePercent) || 0,
        sparkline: Array.from({ length: 16 }, () =>
          Number(
            (
              Number(x.price_usd || 0) *
              (0.98 + Math.random() * 0.04)
            ).toFixed(6)
          )
        ),
      }));

      const save = {
        data: withSpark,
        previous: prices,
        timestamp: Date.now(),
      };

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(save));
      } catch {
        // ignore storage error
      }

      setPreviousPrices(prices);
      setPrices(withSpark);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("fetchPrices error:", err);
      setError("Gagal memuat harga, periksa koneksi.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(() => fetchPrices(true), 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (pullProgress >= 1) {
      setIsRefreshing(true);
      fetchPrices(true);
    }

    setPullProgress(0);
    setBaseTranslate(0);
  };

  const computeItemTranslate = (i, total, base) => {
    const dropPerIndex = 0.06;
    const sensitivity = Math.max(0.12, 1 - i * dropPerIndex);
    const lengthFactor = Math.max(0.5, 1 - total / 80);
    return Math.round(base * sensitivity * lengthFactor);
  };

  const sorted = prices
    .slice()
    .sort((a, b) => Number(b.price_usd) - Number(a.price_usd));
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

  // handler: klik item -> pindah ke /order sambil bawa data koin
  const handleSelectToken = (token) => {
    navigate("/order", {
      state: {
        token, // seluruh object item
      },
    });
  };

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
              ${amoled ? "bg-black/85 border-zinc-900" : "bg-zinc-900/85 border-zinc-800"}
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
          title="BTC bergerak 2.5% hari ini"
          description="Pantau market dan ambil peluang trading terbaik."
          accent="blue"
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
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-t-transparent rounded-full border-emerald-400/80" />
              <div className="text-zinc-400 ml-3 text-sm">
                Memuat data harga...
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl text-red-300 bg-red-900/15 border border-red-800/40 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((item, i) => (
                <PriceItem
                  key={item.symbol || i}
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
                  onClick={() => handleSelectToken(item)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
