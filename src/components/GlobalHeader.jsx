// ===============================
// src/components/GlobalHeader.jsx
// ===============================
import React from "react";
import { Sun, Moon, ChevronLeft } from "lucide-react";

export default function GlobalHeader({
  title = "CryptoKu",
  subtitle,
  onBack,
  onToggleTheme,
  theme = "dark", // "dark" | "amoled"
}) {
  const isAmoled = theme === "amoled";

  return (
    <header
      className={`
        flex items-center justify-between
        pt-2 pb-3
      `}
    >
      {/* LEFT: Back + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className={`
              inline-flex h-8 w-8 items-center justify-center rounded-full
              border text-zinc-300
              ${isAmoled ? "border-zinc-800 bg-black" : "border-zinc-700 bg-zinc-900"}
              active:scale-95 transition
            `}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="min-w-0">
          <p
            className={`
              text-lg font-semibold truncate
              bg-gradient-to-r
              ${isAmoled ? "from-white to-zinc-400" : "from-white to-emerald-300"}
              bg-clip-text text-transparent
            `}
          >
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: Theme toggle */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
            border
            ${isAmoled
              ? "border-zinc-800 bg-black text-zinc-300 hover:bg-zinc-900"
              : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"}
            transition active:scale-95
          `}
        >
          {isAmoled ? (
            <>
              <Moon size={14} />
              <span>AMOLED</span>
            </>
          ) : (
            <>
              <Sun size={14} />
              <span>DARK</span>
            </>
          )}
        </button>
      )}
    </header>
  );
}
