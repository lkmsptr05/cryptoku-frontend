// ===============================
// src/pages/Activity.jsx
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import useTelegramAuth from "../hooks/useTelegramAuth";
import { useBalanceHistory } from "../hooks/useBalanceHistory";
import useOrderHistory from "../hooks/useOrderHistory";

// ⬇️ NEW: import pending topup context
import { usePendingTopup } from "../contexts/PendingTopupContext.jsx";

// helper format
const formatRupiah = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "Rp0";
  return num.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// skeleton row
function ActivitySkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-3 w-40 bg-zinc-900 rounded-full animate-pulse" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-20 bg-zinc-800 rounded-full animate-pulse" />
        <div className="h-3 w-16 bg-zinc-900 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// badge kecil type
function TypeBadge({ label, color = "zinc" }) {
  const base =
    "inline-flex items-center px-2 py-[2px] rounded-full text-[10px] border";
  const map = {
    saldo: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
    order: "border-sky-500/40 text-sky-300 bg-sky-500/10",
    error: "border-red-500/40 text-red-300 bg-red-500/10",
    zinc: "border-zinc-600 text-zinc-300 bg-zinc-800/60",
  };

  return <span className={`${base} ${map[color] || map.zinc}`}>{label}</span>;
}

/* ====================== MAIN: Activity Page ====================== */
export default function Activity() {
  const { amoled, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationsBadge();

  // auth (buat initData header)
  const { initData, loading: authLoading } = useTelegramAuth();

  // tab aktivtas
  const [activeTab, setActiveTab] = useState("balance"); // "balance" | "orders"
  const isBalanceTab = activeTab === "balance";

  // ⬇️ NEW: pending topup context (badge + info tab aktif)
  const { pendingCount, setIsTopupTabActive } = usePendingTopup();

  // tandai ke watcher global kalau lagi di tab "Riwayat Topup"
  useEffect(() => {
    setIsTopupTabActive(activeTab === "orders");
    return () => {
      // kalau halaman Activity unmount, jangan dianggap masih di tab topup
      setIsTopupTabActive(false);
    };
  }, [activeTab, setIsTopupTabActive]);

  // floating header seperti page lain
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  // hooks data
  const {
    items: balanceItems,
    loading: balanceLoading,
    loadingMore: balanceLoadingMore,
    error: balanceError,
    hasMore: balanceHasMore,
    loadMore: loadMoreBalance,
  } = useBalanceHistory({ initData });

  const {
    items: orderItems,
    loading: orderLoading,
    loadingMore: orderLoadingMore,
    error: orderError,
    hasMore: orderHasMore,
    loadMore: loadMoreOrders,
  } = useOrderHistory({ initData });

  const bgClass = amoled
    ? "bg-black"
    : "bg-gradient-to-b from-zinc-950 to-black";

  const cardBaseClass = amoled
    ? "bg-black/50 border-zinc-800"
    : "bg-zinc-900/80 border-zinc-800";

  return (
    <div
      className={`min-h-screen px-4 pt-16 pb-28 text-white animate-fade ${bgClass}`}
    >
      {/* ===========================
          FLOATING HEADER
      ============================ */}
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full mx-auto pointer-events-auto">
          <div
            className={`
              rounded-b-lg px-5 border
              backdrop-blur-md shadow-md
              ${
                amoled
                  ? "bg-black/85 border-zinc-900"
                  : "bg-zinc-900/85 border-zinc-800"
              }
            `}
            style={{
              transform: showHeader ? "translateY(0)" : "translateY(-100%)",
              opacity: showHeader ? 1 : 0,
              transition: "transform 0.35s ease, opacity 0.5s ease",
            }}
          >
            <GlobalHeader
              title="Aktivitas"
              subtitle="Riwayat saldo & order"
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>

      {/* ===========================
          PAGE CONTENT
      ============================ */}
      <div className="max-w-md mx-auto space-y-4 mt-4">
        {/* Tabs */}
        <section
          className={`rounded-2xl border px-2 py-2 flex gap-1 ${cardBaseClass}`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("balance")}
            className={`flex-1 text-center text-xs font-medium rounded-xl py-2 transition
              ${
                isBalanceTab
                  ? "bg-emerald-500 text-black shadow border border-emerald-400/70"
                  : "bg-transparent text-zinc-400 border border-transparent"
              }`}
          >
            Riwayat Saldo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 text-center text-xs font-medium rounded-xl py-2 transition flex items-center justify-center gap-1
              ${
                !isBalanceTab
                  ? "bg-sky-500 text-black shadow border border-sky-400/70"
                  : "bg-transparent text-zinc-400 border border-transparent"
              }`}
          >
            <span>Riwayat Topup</span>
            {pendingCount > 0 && (
              <span className="min-w-[16px] px-1 text-[9px] bg-amber-500 text-black rounded-full text-center font-semibold">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>
        </section>

        {/* Content card */}
        <section className={`rounded-2xl border p-4 ${cardBaseClass}`}>
          {/* header kecil */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {isBalanceTab ? "Mutasi saldo IDR" : "Riwayat top up"}
              </p>

              <p className="text-xs text-zinc-400">
                {authLoading
                  ? "Menyiapkan data Telegram..."
                  : isBalanceTab
                  ? "Perubahan saldo dari top up, pembelian, dan penyesuaian."
                  : "Riwayat pengisian saldo Cryptoku melalui midtrans."}
              </p>
            </div>
          </div>

          <div className="mt-3 h-px bg-zinc-800/80" />

          {/* LIST CONTENT */}
          <div className="mt-1 divide-y divide-zinc-800/80">
            {isBalanceTab ? (
              <>
                {/* Loading skeleton */}
                {balanceLoading && (
                  <>
                    <ActivitySkeletonRow />
                    <ActivitySkeletonRow />
                    <ActivitySkeletonRow />
                  </>
                )}

                {/* Error */}
                {!balanceLoading && balanceError && (
                  <p className="text-[11px] text-amber-400 py-3">
                    {balanceError}
                  </p>
                )}

                {/* Empty */}
                {!balanceLoading &&
                  !balanceError &&
                  (!balanceItems || balanceItems.length === 0) && (
                    <p className="text-[11px] text-zinc-500 py-3">
                      Belum ada aktivitas saldo.
                    </p>
                  )}

                {/* Items */}
                {balanceItems.map((item) => {
                  const amount = Number(item.amount) || 0;
                  const positive = amount > 0;
                  const negative = amount < 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <TypeBadge label="Saldo" color="saldo" />
                          <span className="text-xs text-zinc-300 truncate">
                            {item.note || item.change_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end text-right">
                        <div
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            positive
                              ? "text-emerald-400"
                              : negative
                              ? "text-red-400"
                              : "text-zinc-200"
                          }`}
                        >
                          {positive && (
                            <ArrowUp className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {negative && (
                            <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>
                            {positive ? "+" : ""}
                            {formatRupiah(Math.abs(amount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load more */}
                {balanceHasMore && !balanceLoading && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={loadMoreBalance}
                      disabled={balanceLoadingMore}
                      className="w-full text-xs font-medium py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      {balanceLoadingMore && (
                        <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      )}
                      <span>
                        {balanceLoadingMore
                          ? "Memuat lagi..."
                          : "Muat aktivitas saldo lainnya"}
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ORDERS / TOPUP HISTORY TAB */}

                {orderLoading && (
                  <>
                    <ActivitySkeletonRow />
                    <ActivitySkeletonRow />
                    <ActivitySkeletonRow />
                  </>
                )}

                {!orderLoading && orderError && (
                  <p className="text-[11px] text-amber-400 py-3">
                    {orderError}
                  </p>
                )}

                {!orderLoading &&
                  !orderError &&
                  (!orderItems || orderItems.length === 0) && (
                    <p className="text-[11px] text-zinc-500 py-3">
                      Belum ada riwayat top up.
                    </p>
                  )}

                {!orderLoading &&
                  !orderError &&
                  orderItems &&
                  orderItems.length > 0 && (
                    <div className="divide-y divide-zinc-800/80">
                      {orderItems.map((order) => {
                        const status = (order.status || "").toLowerCase();
                        const isPending = status === "pending";
                        const isSuccess = status === "success";
                        const isFailed = status === "failed";

                        // status badge
                        let statusLabel = "Menunggu";
                        let statusClass =
                          "text-amber-300 border-amber-500/40 bg-amber-500/10";

                        if (isSuccess) {
                          statusLabel = "Berhasil";
                          statusClass =
                            "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
                        } else if (isFailed) {
                          statusLabel = "Gagal";
                          statusClass =
                            "text-red-300 border-red-500/40 bg-red-500/10";
                        }

                        // payment method label
                        const paymentType = (
                          order.payment_type || ""
                        ).toLowerCase();
                        let paymentLabel = "Metode tidak dikenal";

                        if (paymentType.includes("qris")) {
                          paymentLabel = "QRIS";
                        } else if (paymentType.includes("gopay")) {
                          paymentLabel = "GoPay";
                        } else if (paymentType.includes("shopee")) {
                          paymentLabel = "ShopeePay";
                        } else if (paymentType.includes("va")) {
                          paymentLabel = "Virtual Account";
                        }

                        const amountIdr = Number(order.amount || 0);

                        // order id pendek untuk tampilan
                        const shortOrderId = order.order_id
                          ? `#${order.order_id.slice(-8)}`
                          : "-";

                        const canResume = isPending && !!order.snap_token;

                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <TypeBadge label="Top Up" color="order" />
                                <span className="text-xs text-zinc-100 truncate">
                                  Top up saldo CryptoKu
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                                <span className="truncate">{shortOrderId}</span>
                                <span className="w-[3px] h-[3px] rounded-full bg-zinc-600" />
                                <span className="inline-flex items-center px-2 py-[1px] rounded-full border border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-300">
                                  {paymentLabel}
                                </span>
                              </div>

                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {formatDateTime(order.created_at)}
                              </p>
                            </div>

                            <div className="flex flex-col items-end text-right gap-1">
                              <span className="text-xs font-semibold text-zinc-50">
                                {formatRupiah(amountIdr)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] border ${statusClass}`}
                              >
                                <span className="w-[6px] h-[6px] rounded-full bg-current mr-1 opacity-80" />
                                {statusLabel}
                              </span>

                              {canResume && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.snap?.pay(order.snap_token, {
                                      onSuccess: () => {
                                        // optional: trigger refetch orders setelah beberapa detik
                                      },
                                      onPending: () => {},
                                      onError: () => {},
                                      onClose: () => {},
                                    })
                                  }
                                  className="mt-0.5 px-2 py-[3px] rounded-lg bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 active:scale-[0.97] transition"
                                >
                                  Lanjutkan pembayaran
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                {orderHasMore && !orderLoading && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={loadMoreOrders}
                      disabled={orderLoadingMore}
                      className="w-full text-xs font-medium py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      {orderLoadingMore && (
                        <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      )}
                      <span>
                        {orderLoadingMore
                          ? "Memuat lagi..."
                          : "Muat riwayat top up lainnya"}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
