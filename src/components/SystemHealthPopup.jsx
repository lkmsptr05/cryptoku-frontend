// ===============================
// src/components/SystemHealthPopup.jsx
// ===============================
import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function SystemHealthPopup({ health, onClose }) {
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

  const getBars = (status) => {
    if (status === "GOOD") return 3;
    if (status === "WARNING") return 2;
    return 1;
  };

  const getColor = (status) => {
    if (status === "GOOD") return "bg-green-500";
    if (status === "WARNING") return "bg-orange-500";
    return "bg-red-500";
  };

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
    }, 200); // samain sama durasi transition
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
          px-5 pt-3 pb-5 mb-4
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

        <h2 className="text-lg font-semibold mb-2 text-white">
          System Health Status
        </h2>

        {/* AREA LIST – scrollable Y only */}
        <div
          className="
            mt-1
            flex-1
            space-y-4
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
          {health.map((h, i) => {
            const totalBars = getBars(h.status);

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border ${
                  amoled
                    ? "border-zinc-800 bg-zinc-900/70"
                    : "border-zinc-700 bg-zinc-800/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* INFO */}
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-white font-semibold mb-1 break-words">
                      {h.component_name}
                    </p>

                    <p className="text-sm text-zinc-300 break-words">
                      {h.message || "Initial state: Unchecked"}
                    </p>

                    {h.last_checked && (
                      <p className="text-xs text-zinc-500 mt-1 break-words">
                        {h.last_checked}
                      </p>
                    )}
                  </div>

                  {/* SIGNAL BAR */}
                  <div className="flex gap-1 items-end shrink-0">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`w-1.5 rounded-sm ${
                          bar <= totalBars
                            ? getColor(h.status)
                            : amoled
                            ? "bg-zinc-700"
                            : "bg-zinc-600"
                        }`}
                        style={{
                          height:
                            bar === 1
                              ? 8
                              : bar === 2
                              ? 12
                              : 16,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BUTTON */}
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
