// ===============================
// src/pages/Home.jsx
// ===============================
import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getSystemHealth, getAllPrices } from "../services/api";
import SystemHealthPopup from "../components/SystemHealthPopup";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";

export default function Home() {
  const { amoled, toggleTheme } = useTheme();

  const [health, setHealth] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [gainers, setGainers] = useState([]);
  const [loadingGainers, setLoadingGainers] = useState(true);

  // =============================
  // FLOATING HEADER STATE
  // =============================
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // =============================
  // FORMAT PAIR (ethusdt → ETH/USDT)
  // =============================
  const formatPair = (symbol) =>
    symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1");

  // =============================
  // LOAD SYSTEM HEALTH
  // =============================
  const refreshHomeData = async () => {
    try {
      const res = await getSystemHealth();
      setHealth(res || []);
    } catch (e) {
      console.error("Error getSystemHealth:", e);
    }
  };

  // =============================
  // LOAD TOP 3 GAINERS
  // =============================
  const loadTopGainers = async () => {
    try {
      setLoadingGainers(true);

      const prices = await getAllPrices();

      const sorted = [...prices]
        .filter(
          (t) =>
            t.priceChangePercent !== undefined &&
            t.priceChangePercent !== null
        )
        .map((t) => ({
          ...t,
          priceChangePercent: Number(t.priceChangePercent),
        }))
        .filter((t) => !Number.isNaN(t.priceChangePercent))
        .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
        .slice(0, 3);

      setGainers(sorted);
    } catch (err) {
      console.error("Error memuat top gainers:", err);
    } finally {
      setLoadingGainers(false);
    }
  };

  // =============================
  // INIT LOAD + AUTO REFRESH
  // =============================
  useEffect(() => {
    refreshHomeData();
    loadTopGainers();

    const interval = setInterval(() => {
      refreshHomeData();
      loadTopGainers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =============================
  // SCROLL LISTENER UNTUK HIDE / SHOW HEADER
  // =============================
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

  return (
    <div
      className={`animate-fade min-h-screen px-4 pt-[92px] pb-32 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-950 to-black"
      } text-white`}
    >
      {/* ===========================
          FULL WIDTH FLOATING HEADER
      ============================ */}
      <div className="fixed top-0 inset-x-0 z-40">
        <div
          className={`
            w-full
            transition-all duration-300
            backdrop-blur-md
            border-b
            ${amoled ? "bg-black/90 border-zinc-900" : "bg-zinc-900/85 border-zinc-800"}
            ${showHeader ? "translate-y-0" : "-translate-y-full"}
          `}
        >
          <div className="max-w-md mx-auto px-4 pt-4 pb-3">
            <GlobalHeader
              title="CryptoKu"
              subtitle="Beranda"
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
            />
          </div>
        </div>
      </div>

      {/* ===========================
          PAGE CONTENT
      ============================ */}
      <div className="max-w-md mx-auto space-y-5">
        {/* Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-zinc-800 shadow-lg ${
            amoled
              ? "bg-black/40"
              : "bg-gradient-to-r from-zinc-900/80 to-zinc-800/80"
          } p-4`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%)]" />
          <div className="relative flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Banner Toko
            </p>
            <p className="text-lg font-semibold">Selamat datang di CryptoKu</p>
            <p className="text-sm text-zinc-400">
              Promosi spesial, fee murah, atau info toko kamu bisa tampil di sini.
            </p>
          </div>
        </div>

        {/* Health + Index */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPopup(true)}
            className={`group rounded-2xl border border-zinc-800 p-4 shadow-md text-left transition transform hover:-translate-y-[1px] hover:border-zinc-700 ${
              amoled ? "bg-black/40" : "bg-zinc-900/80"
            }`}
          >
            <p className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
              <span>System Health</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] text-emerald-400 border border-emerald-500/30">
                Live
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </p>
            <p className="text-emerald-400 text-xl font-bold">OK</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Tap untuk detail status sistem
            </p>
          </button>

          <div
            className={`rounded-2xl border border-zinc-800 p-4 shadow-md ${
              amoled ? "bg-black/40" : "bg-zinc-900/80"
            }`}
          >
            <p className="text-xs text-zinc-400 mb-1">Index Crypto</p>
            <span className="text-emerald-400 text-xl font-bold flex items-center gap-1">
              ▲ 2.41%
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">
              Performa rata-rata market
            </p>
          </div>
        </div>

        {/* TOP GAINERS */}
        <div
          className={`rounded-2xl border border-zinc-800 shadow-md ${
            amoled ? "bg-black/40" : "bg-zinc-900/80"
          }`}
        >
          <div className="px-4 pt-4 pb-3 flex justify-between">
            <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">
              Top Gainers
            </p>
            <p className="text-[10px] text-zinc-500">
              Auto 30 detik
            </p>
          </div>

          <div className="px-4 pb-4">
            {loadingGainers ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-3 bg-zinc-900 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800">
                {gainers.map((t, i) => (
                  <div key={i} className="flex justify-between py-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {formatPair(t.symbol)}
                      </p>
                      <p className="text-sm font-semibold">
                        ${t.price_usd.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Rp {t.price_idr.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        t.priceChangePercent >= 0
                          ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                          : "text-red-400 border-red-500/40 bg-red-500/5"
                      }`}
                    >
                      {t.priceChangePercent >= 0 ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                      {Math.abs(t.priceChangePercent).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <SystemHealthPopup
          health={health}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
