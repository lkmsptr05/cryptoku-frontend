// ===============================
// src/pages/Home.jsx
// ===============================
import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getSystemHealth, getAllPrices } from "../services/api";
import SystemHealthPopup from "../components/SystemHealthPopup";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import BannerBox from "../components/BannerBox";

export default function Home() {
  const { amoled, toggleTheme } = useTheme();

  const [health, setHealth] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [gainers, setGainers] = useState([]);

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
  const refreshHomeData = () => {
    getSystemHealth()
      .then((res) => setHealth(res || []))
      .catch(console.error);
  };

  // =============================
  // LOAD TOP 3 GAINERS (REAL DATA)
  // =============================
  const loadTopGainers = async () => {
    try {
      const prices = await getAllPrices();

      const sorted = [...prices]
        .filter(
          (t) =>
            t.priceChangePercent !== undefined && t.priceChangePercent !== null
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
    }
  };

  // =============================
  // INIT LOAD
  // =============================
  useEffect(() => {
    refreshHomeData();
    loadTopGainers();
  }, []);

  // =============================
  // SCROLL LISTENER UNTUK FLOATING HEADER
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

      // scroll turun → sembunyikan
      if (diff > 4 && currentY > 40) {
        setShowHeader(false);
      }
      // scroll naik → tampilkan lagi
      else if (diff < -4) {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`animate-fade min-h-screen px-4 pt-16 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-950 to-black"
      } text-white pb-32`}
    >
      {/* ===========================
          FLOATING GLOBAL HEADER
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
        <BannerBox
          label="Banner Toko"
          title="Selamat datang di CryptoKu"
          description="Promosi spesial, fee lebih murah, atau info toko kamu bisa tampil di sini."
          accent="emerald"
        />

        {/* Health + Index */}
        <div className="grid grid-cols-2 gap-3">
          {/* System Health */}
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

          {/* Index Crypto */}
          <div
            className={`rounded-2xl border border-zinc-800 p-4 shadow-md transition ${
              amoled ? "bg-black/40" : "bg-zinc-900/80"
            }`}
          >
            <p className="text-xs text-zinc-400 mb-1">Index Crypto</p>
            <div className="flex items-baseline gap-2">
              <span className="text-emerald-400 text-xl font-bold flex items-center gap-1">
                ▲ 2.41%
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Performa rata-rata market 24 jam
            </p>
          </div>
        </div>

        {/* ======================
            REAL TOP 3 GAINERS
        ======================= */}
        <div
          className={`rounded-2xl border border-zinc-800 shadow-md ${
            amoled ? "bg-black/40" : "bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <p className="text-xs text-zinc-400 mb-1 uppercase tracking-[0.18em]">
                Top Gainers
              </p>
              <p className="text-sm text-zinc-300">
                3 token dengan kenaikan tertinggi 24 jam
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            {gainers.length === 0 ? (
              <p className="text-zinc-500 text-center py-4 text-sm">
                Memuat data…
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800">
                {gainers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 first:pt-1"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {formatPair(t.symbol)}
                        </p>
                        <span className="text-[11px] text-zinc-500">
                          #{i + 1}
                        </span>
                      </div>

                      <p className="text-sm font-semibold mt-[2px]">
                        ${t.price_usd.toLocaleString()}
                      </p>

                      <p className="text-[11px] text-zinc-500 mt-[1px]">
                        Rp {t.price_idr.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${
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
                      <span>{Math.abs(t.priceChangePercent).toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Berita */}
        <div
          className={`rounded-2xl border border-zinc-800 shadow-md ${
            amoled ? "bg-black/40" : "bg-zinc-900/80"
          } p-4 mb-10`}
        >
          <p className="text-xs text-zinc-400 mb-1 uppercase tracking-[0.18em]">
            Berita Crypto
          </p>
          <p className="text-sm text-zinc-300 mb-1">Coming soon…</p>
          <p className="text-[11px] text-zinc-500">
            Nantinya, update berita market dan on-chain bisa tampil di sini.
          </p>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <SystemHealthPopup
          health={health}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
