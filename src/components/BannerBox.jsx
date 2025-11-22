// ===============================
// src/components/BannerBox.jsx
// ===============================
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function BannerBox({
  label = "Banner",
  title = "Judul banner",
  description = "Deskripsi banner di sini",
  accent = "emerald", // optional: emerald | blue | purple | red
}) {
  const { amoled } = useTheme();

  const accentMap = {
    emerald: "bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%)]",
    blue: "bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]",
    purple: "bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_55%)]",
    red: "bg-[radial-gradient(circle_at_top,_#ef4444_0,_transparent_55%)]",
  };

  return (
    <div
      className={`relative mt-5 overflow-hidden rounded-2xl border shadow-lg p-4
      ${
        amoled
          ? "bg-black/40 border-zinc-800"
          : "bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border-zinc-800"
      }`}
    >
      {/* Accent glow */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-30 ${
          accentMap[accent] || accentMap.emerald
        }`}
      />

      {/* Content */}
      <div className="relative flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </p>

        <p className="text-lg font-semibold">
          {title}
        </p>

        <p className="text-sm text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
