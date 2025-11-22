// ===============================
// src/pages/Order.jsx
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import OrderHistoryPopup from "../components/OrderHistoryPopup";
import BannerBox from "../components/BannerBox";


// Dummy history sementara (nanti bisa diganti API)
const DUMMY_HISTORY = [
  {
    id: "ORD-001",
    symbol: "BTCUSDT",
    side: "BUY",
    amountUsd: 100,
    amountToken: 0.0012,
    priceUsd: 82000,
    createdAt: "2025-01-01 12:10",
    status: "Completed",
  },
  {
    id: "ORD-002",
    symbol: "ETHUSDT",
    side: "BUY",
    amountUsd: 50,
    amountToken: 0.018,
    priceUsd: 2800,
    createdAt: "2025-01-02 09:32",
    status: "Pending",
  },
];

// helper format pair
const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1") || "-";


/* ====================== MAIN: Order Page ====================== */
export default function Order() {
  const { amoled, toggleTheme } = useTheme();
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = state?.token || null;

  // floating header state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const [showHistory, setShowHistory] = useState(false);

  // scroll listener — sama seperti Home & Market
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

  const positive = token ? token.priceChangePercent >= 0 : true;

  return (
    <div
      className={`min-h-screen px-4 pt-16 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-950 to-black"
      } text-white pb-32`}
    >
      {/* ===========================
          FLOATING HEADER
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
              title="Order"
              subtitle={
                token
                  ? formatPair(token.symbol)
                  : "Silahkan pilih koin di Market"
              }
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
        <BannerBox
          label="Tips"
          title="Waktu terbaik membeli"
          description="Biasanya harga lebih stabil saat volume rendah."
          accent="purple"
        />

        {/* ====== MODE TANPA TOKEN: Dashboard 3 Card + History popup ====== */}
        {!token && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {/* Card Order -> ke Market */}
              <button
                type="button"
                onClick={() => navigate("/market")}
                className={`
                  rounded-2xl border p-4 text-left shadow-md
                  ${
                    amoled
                      ? "bg-black/40 border-zinc-800"
                      : "bg-zinc-900/80 border-zinc-800"
                  }
                  active:scale-[0.98] transition
                `}
              >
                <p className="text-xs text-zinc-400 mb-1">
                  Buat Order
                </p>
                <p className="text-sm font-semibold text-white">
                  Pilih koin di Market
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Tap untuk menuju halaman Market.
                </p>
              </button>

              {/* Card History -> buka popup */}
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className={`
                  rounded-2xl border p-4 text-left shadow-md
                  ${
                    amoled
                      ? "bg-black/40 border-zinc-800"
                      : "bg-zinc-900/80 border-zinc-800"
                  }
                  active:scale-[0.98] transition
                `}
              >
                <p className="text-xs text-zinc-400 mb-1">
                  Riwayat Order
                </p>
                <p className="text-sm font-semibold text-white">
                  Lihat semua order
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Tap untuk melihat riwayat order kamu.
                </p>
              </button>

              {/* Card lain-lain (placeholder) */}
              <button
                type="button"
                className={`
                  col-span-2 rounded-2xl border p-4 text-left shadow-md
                  ${
                    amoled
                      ? "bg-black/40 border-zinc-800"
                      : "bg-zinc-900/80 border-zinc-800"
                  }
                  active:scale-[0.98] transition
                `}
              >
                <p className="text-xs text-zinc-400 mb-1">
                  Fitur Lainnya
                </p>
                <p className="text-sm font-semibold text-white">
                  Coming soon
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Di sini bisa diisi fitur seperti template order, favorit, dsb.
                </p>
              </button>
            </div>

            {/* Popup History */}
            {showHistory && (
              <OrderHistoryPopup
                orders={DUMMY_HISTORY}
                onClose={() => setShowHistory(false)}
              />
            )}
          </>
        )}

        {/* ====== MODE ADA TOKEN: Form BUY seperti sebelumnya ====== */}
        {token && (
          <>
            {/* INFO COIN */}
            <div
              className={`rounded-2xl border border-zinc-800 p-4 shadow-md ${
                amoled ? "bg-black/40" : "bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {formatPair(token.symbol)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Last price (USD)
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${token.price_usd.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Rp {token.price_idr.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div
                className={`mt-3 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                  positive
                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                    : "text-red-400 border-red-500/40 bg-red-500/5"
                }`}
              >
                {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>
                  {positive ? "+" : ""}
                  {Math.abs(token.priceChangePercent).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* INPUT ORDER */}
            <div
              className={`rounded-2xl border border-zinc-800 p-4 shadow-md space-y-3 ${
                amoled ? "bg-black/40" : "bg-zinc-900/80"
              }`}
            >
              <p className="text-xs text-zinc-400 uppercase tracking-[0.15em]">
                Buy Order
              </p>

              <div>
                <label className="text-xs text-zinc-400">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full mt-1 bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Estimasi ({formatPair(token.symbol)})
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Auto calculate"
                  className="w-full mt-1 bg-black/20 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-400"
                />
              </div>

              <div className="pt-2">
                <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-semibold active:scale-[0.99] transition-transform">
                  BUY {formatPair(token.symbol)}
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-500 text-center pt-2">
              Data koin diambil dari halaman Market (real-time).
            </div>
          </>
        )}
      </div>
    </div>
  );
}
