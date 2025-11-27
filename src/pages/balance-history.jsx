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

function safeParseMeta(meta) {
  if (!meta) return null;

  if (typeof meta === "object") return meta;

  if (typeof meta === "string") {
    try {
      return JSON.parse(meta);
    } catch (e) {
      return { raw: meta };
    }
  }

  return null;
}

const formatTokenPair = (meta) => {
  if (meta?.token_pair) return meta.token_pair;

  if (meta?.token_symbol) {
    const sym = String(meta.token_symbol).toUpperCase();
    if (sym.endsWith("USDT")) {
      const base = sym.replace(/USDT$/i, "");
      return `${base}/USDT`;
    }
    return sym;
  }

  return null;
};

const formatNetworkLabel = (meta) => {
  if (meta?.network_label) return meta.network_label;

  if (meta?.network_key) {
    const key = String(meta.network_key).toLowerCase();
    if (key === "bsc") return "BNB Chain";
    if (key === "base") return "Base";
    if (key === "op" || key === "optimism") return "Optimism";
    if (key === "eth" || key === "ethereum") return "Ethereum";
    return meta.network_key;
  }

  return null;
};

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
  const renderMetadataDetail = (h) => {
    const meta = safeParseMeta(h?.metadata);
    if (!meta || Object.keys(meta).length === 0) return null;

    // 🔹 TOPUP
    if (h.change_type === "topup") {
      return (
        <div className="mt-1.5 text-[11px] bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 space-y-1.5">
          {meta.message && (
            <p className="text-zinc-100 font-medium">{meta.message}</p>
          )}

          <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
            {meta.method && <li>Metode: {meta.method}</li>}
            {meta.status && <li>Status: {meta.status}</li>}
            {h.related_topup_id && <li>ID Topup: #{h.related_topup_id}</li>}
          </ul>
        </div>
      );
    }

    if (h.change_type === "reward") {
      return (
        <div className="mt-1.5 text-[11px] bg-zinc-950/80 rounded-lg p-2 border border-emerald-700/70 space-y-1.5">
          <p className="text-emerald-300 font-medium">
            Hadiah saldo dari CryptoKu.
          </p>

          <ul className="list-disc list-inside space-y-0.5 text-emerald-100/90">
            {meta.message && <li>{meta.message}</li>}
            {meta.reason && <li>Alasan: {meta.reason}</li>}
            {h.related_topup_id && (
              <li>ID Reward/Topup: #{h.related_topup_id}</li>
            )}
          </ul>
        </div>
      );
    }

    // 🔹 BUY LOCK
    if (h.change_type === "buy_lock") {
      const pair = formatTokenPair(meta);
      const networkLabel = formatNetworkLabel(meta);

      return (
        <div className="mt-1.5 text-[11px] bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 space-y-1.5">
          <p className="text-zinc-100 font-medium">
            Saldo berhasil dikunci untuk proses pembelian.
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
            {pair && <li>Pair: {pair}</li>}
            {networkLabel && <li>Jaringan: {networkLabel}</li>}
            {meta.amount_idr && (
              <li>
                Nominal: Rp {Number(meta.amount_idr).toLocaleString("id-ID")}
              </li>
            )}
            {h.related_order_id && <li>ID Order: #{h.related_order_id}</li>}
          </ul>
        </div>
      );
    }

    // 🔹 BUY SUCCESS / FAILED
    if (h.change_type === "buy_success" || h.change_type === "buy_failed") {
      const pair = formatTokenPair(meta);
      const networkLabel = formatNetworkLabel(meta);

      return (
        <div className="mt-1.5 text-[11px] bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 space-y-1.5">
          {meta.error ? (
            <p className="text-red-300 font-medium">{meta.error}</p>
          ) : (
            <p className="text-zinc-100 font-medium">
              Transaksi pembelian telah diproses.
            </p>
          )}

          <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
            {pair && <li>Pair: {pair}</li>}
            {networkLabel && <li>Jaringan: {networkLabel}</li>}
            {meta.amount_idr && (
              <li>
                Nominal: Rp {Number(meta.amount_idr).toLocaleString("id-ID")}
              </li>
            )}
            {meta.service_fee_idr && (
              <li>
                Biaya layanan: Rp{" "}
                {Number(meta.service_fee_idr).toLocaleString("id-ID")}
              </li>
            )}
            {meta.gas_fee_idr && (
              <li>
                Biaya jaringan: Rp{" "}
                {Number(meta.gas_fee_idr).toLocaleString("id-ID")}
              </li>
            )}
            {meta.tx_hash && (
              <li className="break-all">Tx Hash: {meta.tx_hash}</li>
            )}
            {h.related_order_id && <li>ID Order: #{h.related_order_id}</li>}
          </ul>
        </div>
      );
    }

    // 🔹 FALLBACK: key-value list, bukan JSON mentah
    return (
      <div className="mt-1.5 text-[11px] bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 text-zinc-300">
        <ul className="list-disc list-inside space-y-0.5">
          {Object.entries(meta).map(([key, value]) => (
            <li key={key}>
              <span className="font-medium">{key}:</span>{" "}
              <span>
                {typeof value === "string" ? value : JSON.stringify(value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

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

                          {isExpanded && renderMetadataDetail(h)}
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
