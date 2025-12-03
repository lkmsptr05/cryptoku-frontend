// ===============================
// src/components/BannerBox.jsx
// ===============================
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function BannerBox({
  label = "Banner",
  title = "",
  description = "",
  bgImage = "",
  accent = "emerald",
}) {
  const { amoled } = useTheme();

  const accentMap = {
    emerald: "bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%)]",
    blue: "bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]",
    purple: "bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_55%)]",
    red: "bg-[radial-gradient(circle_at_top,_#ef4444_0,_transparent_55%)]",
  };

  const noText = !title && !description;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border shadow-lg p-4
        min-h-[110px]     // <— tinggi konsisten
        flex items-end    // <— teks rata bawah seperti banner profesional
        ${
          amoled
            ? "bg-black/40 border-zinc-800"
            : "bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border-zinc-800"
        }
      `}
      style={
        noText && bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {/* Accent glow — hilang ketika pakai gambar */}
      {!noText && (
        <div
          className={`absolute inset-0 pointer-events-none opacity-30 ${
            accentMap[accent] || accentMap.emerald
          }`}
        />
      )}

      {/* Content */}
      {!noText && (
        <div className="relative flex flex-col gap-1">
          {label && (
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              {label}
            </p>
          )}
          {title && <p className="text-lg font-semibold">{title}</p>}
          {description && (
            <p className="text-sm text-zinc-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
