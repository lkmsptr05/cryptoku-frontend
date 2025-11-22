// ===============================
// src/components/OrderHistoryPopup.jsx
// ===============================
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1") || "-";

export default function OrderHistoryPopup({ orders, onClose }) {
  const { amoled } = useTheme();

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(null);

  // base translate for enter/exit animation (% of height)
  const [baseY, setBaseY] = useState(100); // start hidden below
  const [isClosing, setIsClosing] = useState(false);

  // ========== ANIMASI MASUK (SLIDE DARI BAWAH) ==========
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setBaseY(0);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // ========== FUNGSI CLOSE DENGAN ANIMASI SLIDE DOWN ==========
  const triggerClose = (withVibrate = false) => {
    if (isClosing) return;
    setIsClosing(true);
    setDragY(0);
    setBaseY(100); // geser turun

    if (withVibrate && typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    setTimeout(() => {
      onClose();
    }, 200); // sama dengan durasi transition
  };

  // ========== DRAG HANDLERS (HANDLE ONLY) ==========
  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    setStartY(e.touches[0].clientY);
    setDragging(true);
    setDragY(0);
  };

  const handleTouchMove = (e) => {
    if (!dragging || startY == null) return;
    if (!e.touches || !e.touches[0]) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startY;

    if (delta > 0) {
      const clamped = Math.min(delta, 140);
      setDragY(clamped);
    }
  };

  const handleTouchEnd = () => {
    if (!dragging) return;

    const THRESHOLD = 80;

    if (dragY > THRESHOLD) {
      triggerClose(true);
    } else {
      setDragY(0);
    }

    setDragging(false);
    setStartY(null);
  };

  // gabungkan baseY (enter/exit) + dragY (swipe)
  const sheetTransform = `translateY(calc(${baseY}% + ${dragY}px))`;

  return (
    // Overlay: klik di luar sheet -> close dengan animasi
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade"
      style={{
        overscrollBehaviorY: "contain",
      }}
      onClick={() => triggerClose(false)}
    >
      {/* Bottom Sheet */}
      <div
        className={`
          w-full max-w-md mx-auto
          rounded-t-3xl rounded-b-none
          shadow-xl
          px-4 pt-3 pb-5 mb-4
          flex flex-col
          overflow-hidden
          ${amoled ? "bg-black border-t border-zinc-800" : "bg-zinc-900 border-t border-zinc-700"}
        `}
        style={{
          transform: sheetTransform,
          transition: dragging ? "none" : "transform 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()} // klik dalam sheet jangan nutup
      >
        {/* Drag handle – AREA SENTUH DIPERBESAR */}
        <div
          className="w-full flex justify-center mb-2 pt-2 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "none",
          }}
        >
          <div className="w-14 h-1.5 rounded-full bg-zinc-600/80" />
        </div>

        <h2 className="text-base font-semibold mb-1 text-white">
          Riwayat Order
        </h2>
        <p className="text-xs text-zinc-400 mb-3">
          Daftar order yang pernah kamu buat.
        </p>

        {/* LIST ORDER – scrollable Y only */}
        <div
          className="
            flex-1
            space-y-3
            overflow-y-auto
            overflow-x-hidden
            pr-2
            system-scrollbar
          "
          style={{
            maxHeight: "60vh",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            touchAction: "pan-y",
          }}
        >
          {(!orders || orders.length === 0) && (
            <div
              className={`text-sm text-zinc-400 border rounded-2xl px-4 py-6 text-center ${
                amoled ? "border-zinc-800 bg-black/40" : "border-zinc-700 bg-zinc-900/60"
              }`}
            >
              Belum ada riwayat order.
            </div>
          )}

          {orders &&
            orders.map((o) => {
              const positive = true; // BUY only
              const statusColor =
                o.status === "Completed"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : "text-yellow-300 bg-yellow-500/10 border-yellow-500/30";

              return (
                <div
                  key={o.id}
                  className={`
                    rounded-2xl border px-4 py-3 text-sm
                    ${
                      amoled
                        ? "border-zinc-800 bg-zinc-900/70"
                        : "border-zinc-700 bg-zinc-800/80"
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {formatPair(o.symbol)}
                        </p>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {o.side}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-[2px]">
                        {o.createdAt}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        ID: {o.id}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Nominal (USD)</p>
                      <p className="text-sm font-semibold text-white">
                        ${o.amountUsd.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        ≈ {o.amountToken} {formatPair(o.symbol)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div
                      className={`
                        inline-flex items-center gap-1 px-2 py-[2px]
                        rounded-full border text-[11px]
                        ${statusColor}
                      `}
                    >
                      <span>{o.status}</span>
                    </div>

                    <div
                      className={`
                        inline-flex items-center gap-1 px-2 py-[2px]
                        rounded-full border text-[11px]
                        ${
                          positive
                            ? "text-emerald-400 border-emerald-400/40 bg-emerald-500/5"
                            : "text-red-400 border-red-400/40 bg-red-500/5"
                        }
                      `}
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>BUY</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* BUTTON TUTUP */}
        <button
          onClick={() => triggerClose(false)}
          className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition
          ${
            amoled
              ? "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
              : "bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700"
          }`}
        >
          Tutup
        </button>
      </div>

      {/* Custom scrollbar style */}
      <style>{`
        .system-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .system-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .system-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${
            amoled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.2)"
          };
          border-radius: 9999px;
        }

        .system-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: ${
            amoled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.4)"
          };
        }

        .system-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${
            amoled
              ? "rgba(255,255,255,0.3) transparent"
              : "rgba(255,255,255,0.4) transparent"
          };
        }
      `}</style>
    </div>
  );
}
