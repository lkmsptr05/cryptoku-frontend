// src/components/BalanceHistoryList.jsx
import React from "react";
import { useBalanceHistory } from "../hooks/useBalanceHistory.js";

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}Rp ${Math.abs(amount).toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function changeTypeLabelAndClass(changeType) {
  switch (changeType) {
    case "topup":
      return { label: "Top Up", className: "text-green-600" };
    case "buy_lock":
      return { label: "Lock untuk Beli", className: "text-amber-600" };
    case "buy_success":
      return { label: "Beli Sukses", className: "text-green-600" };
    case "buy_failed":
      return { label: "Beli Gagal", className: "text-slate-600" };
    case "withdraw":
      return { label: "Withdraw", className: "text-red-600" };
    case "adjustment":
      return { label: "Penyesuaian", className: "text-slate-600" };
    default:
      return { label: changeType, className: "text-slate-600" };
  }
}

export function BalanceHistoryList({ initData }) {
  const { items, loading, loadingMore, error, hasMore, loadMore } =
    useBalanceHistory({ initData });

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">Riwayat Saldo</h2>

      {loading && !items.length && (
        <p className="text-sm text-slate-500">Memuat riwayat...</p>
      )}

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {!loading && !items.length && !error && (
        <p className="text-sm text-slate-500">Belum ada aktivitas saldo.</p>
      )}

      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {items.map((item) => {
          const { label, className } = changeTypeLabelAndClass(
            item.change_type
          );
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.note || label}</span>
                <span className="text-xs text-slate-500">
                  {label} · {formatDate(item.created_at)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Available: Rp{" "}
                  {item.balance_available_after.toLocaleString("id-ID")} ·
                  Locked: Rp {item.balance_locked_after.toLocaleString("id-ID")}
                </span>
              </div>
              <div className={`ml-3 font-semibold ${className}`}>
                {formatAmount(item.amount)}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-3 w-full text-sm font-medium rounded-xl border border-slate-300 py-2 disabled:opacity-60"
          disabled={loadingMore}
        >
          {loadingMore ? "Memuat..." : "Muat lebih banyak"}
        </button>
      )}
    </div>
  );
}
