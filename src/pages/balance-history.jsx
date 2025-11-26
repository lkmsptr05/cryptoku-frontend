// src/pages/balance-history.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalHeader from "../components/GlobalHeader";
import { useTheme } from "../contexts/ThemeContext";
import { BALANCE_CHANGE_STYLES } from "../constant/balanceHistoryStyles";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import { useBalanceHistory } from "../hooks/useBalanceHistory";

function formatAmount(amount) {
  const n = Number(amount) || 0;
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}Rp ${Math.abs(n).toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BalanceHistoryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme?.() || { theme: "dark" };
  const { unreadCount } = useNotificationsBadge();
  const [expandedId, setExpandedId] = useState(null);

  const isAmoled = theme === "amoled";

  // 🔹 ambil initData sekali di sini
  const tgWebApp = window.Telegram?.WebApp;
  const initData = tgWebApp?.initData || "";

  // 🔹 pakai hook global
  const { items, loading, loadingMore, error, hasMore, loadMore } =
    useBalanceHistory({ initData });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4">
        <GlobalHeader
          title="Riwayat Saldo"
          subtitle="Mutasi saldo IDR akun kamu"
          onBack={() => navigate(-1)}
          theme={theme}
          unreadCount={unreadCount}
        />
      </div>

      <div className="px-4 pb-20">
        {loading && (
          <div className="mt-6 text-xs text-zinc-400">
            Memuat riwayat saldo...
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 text-xs text-red-400">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-8 text-xs text-zinc-500 text-center">
            Belum ada aktivitas saldo.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-4 space-y-3">
            {items.map((h) => {
              const style = BALANCE_CHANGE_STYLES[h.change_type] || {
                label: h.change_type || "Mutasi",
                icon: null,
                pillBg: "bg-zinc-700/30",
                pillText: "text-zinc-200",
                pillBorder: "border border-zinc-600/60",
              };

              const n = Number(h.amount) || 0;
              const amountClass =
                n > 0
                  ? "text-emerald-400"
                  : n < 0
                  ? "text-rose-400"
                  : "text-zinc-200";

              const showMetadata =
                h.metadata && Object.keys(h.metadata || {}).length > 0;
              const isExpanded = expandedId === h.id;

              return (
                <div
                  key={h.id}
                  className={`
                    rounded-2xl px-3 py-2.5 text-xs border
                    border-zinc-800
                    ${
                      isAmoled
                        ? "bg-zinc-950"
                        : "bg-gradient-to-br from-zinc-950/95 via-zinc-950 to-zinc-900"
                    }
                    shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {style.icon && (
                          <style.icon
                            className="w-4 h-4 text-zinc-100"
                            strokeWidth={2}
                          />
                        )}

                        <span
                          className={`
                            inline-flex items-center px-2 py-[2px] rounded-full
                            text-[10px] font-medium gap-1
                            ${style.pillBg} ${style.pillText} ${style.pillBorder}
                          `}
                        >
                          {style.label}
                        </span>
                      </div>

                      <p className="mt-1 font-semibold text-[13px] text-zinc-50">
                        {h.note || style.label}
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-400">
                        Available: Rp{" "}
                        {Number(h.balance_available_after || 0).toLocaleString(
                          "id-ID"
                        )}
                        {" · "}
                        Locked: Rp{" "}
                        {Number(h.balance_locked_after || 0).toLocaleString(
                          "id-ID"
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-500">
                        {formatDate(h.created_at)}
                      </p>

                      {showMetadata && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : h.id)
                            }
                            className="text-[10px] text-zinc-300 underline underline-offset-2"
                          >
                            {isExpanded
                              ? "Sembunyikan detail"
                              : "Lihat detail transaksi"}
                          </button>

                          {isExpanded && (
                            <pre className="mt-1.5 text-[10px] bg-zinc-950/80 rounded-lg p-2 overflow-x-auto text-zinc-300 border border-zinc-800">
                              {JSON.stringify(h.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className={`
                        ml-2 text-right text-[11px] font-semibold
                        ${amountClass}
                      `}
                    >
                      <div>{formatAmount(h.amount)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={loadMore}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-200 bg-zinc-900/70 disabled:opacity-60"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
