// src/components/skeleton/MarketRowSkeleton.jsx
export default function MarketRowSkeleton({ amoled }) {
  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 rounded-2xl border
        ${
          amoled
            ? "bg-black/50 border-zinc-800"
            : "bg-zinc-900/80 border-zinc-800/80"
        }
      `}
    >
      {/* LEFT: icon + name */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-zinc-700/50 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-zinc-700/50 animate-pulse" />
          <div className="h-2 w-14 rounded bg-zinc-700/30 animate-pulse" />
        </div>
      </div>

      {/* RIGHT: price + sparkline */}
      <div className="flex flex-col items-end gap-2">
        <div className="h-3 w-20 rounded bg-zinc-700/50 animate-pulse" />
        <div className="h-[30px] w-24 rounded bg-zinc-700/30 animate-pulse" />
      </div>
    </div>
  );
}
