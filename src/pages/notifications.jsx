// src/pages/notifications.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalHeader from "../components/GlobalHeader";
import { useTheme } from "../contexts/ThemeContext";
import { NOTIFICATION_STYLES } from "../constant/notificationStyles";
import RewardConfetti from "../components/RewardConfetti";
import useNotifications from "../hooks/useNotifications";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme?.() || { theme: "dark" };

  const { items, loading, error, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const [selected, setSelected] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showRewardFX, setShowRewardFX] = useState(false);

  const isAmoled = theme === "amoled";

  const handleClickNotification = async (notif) => {
    setSelected(notif);
    setIsDetailOpen(true);

    if (notif.type === "reward") {
      setShowRewardFX(true);

      // Haptic feedback Telegram
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
      }

      setTimeout(() => setShowRewardFX(false), 1500);
    }

    if (!notif.is_read) {
      try {
        await markAsRead(notif.id);
      } catch (err) {
        console.error("Mark read failed:", err);
      }
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  useEffect(() => {
    if (!isDetailOpen && selected) {
      const t = setTimeout(() => {
        setSelected(null);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isDetailOpen, selected]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  // ✅ RENDER METADATA
  const renderMetadataDetail = (notif) => {
    const meta = notif?.metadata || {};

    // 🎁 Reward (sudah OK, tetap pakai versi lama)
    if (notif?.type === "reward") {
      return (
        <div className="text-[11px] text-emerald-300 bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-2 py-1.5 space-y-0.5">
          {meta.amount && (
            <div>Jumlah: Rp {Number(meta.amount).toLocaleString("id-ID")}</div>
          )}
          {meta.reason && <div>Alasan: {meta.reason}</div>}
        </div>
      );
    }

    // 🛠 System maintenance (sudah OK, tetap pakai versi lama)
    if (notif?.type === "system" && meta.category === "maintenance") {
      return (
        <div className="text-[11px] text-amber-200 bg-amber-900/30 border border-amber-700/50 rounded-lg px-2 py-1.5 space-y-0.5">
          {meta.effective_at && (
            <div>
              Berlaku: {new Date(meta.effective_at).toLocaleString("id-ID")}
            </div>
          )}
          {meta.category && <div>Kategori: {meta.category}</div>}
        </div>
      );
    }

    // 💸 BUY (success / failed / pending) → tampilkan rapi ala email
    if (
      notif?.type === "buy_failed" ||
      notif?.type === "buy_success" ||
      notif?.type === "buy_pending"
    ) {
      const pair =
        meta.pair ||
        meta.token_pair ||
        (typeof notif.body === "string"
          ? (
              notif.body.match(/pembelian\s+([a-z0-9/]+)/i)?.[1] || ""
            ).toUpperCase()
          : "");

      const networkLabel =
        meta.network_label || meta.network || meta.network_key || null;

      return (
        <div className="text-[11px] bg-zinc-900/70 border border-zinc-700/70 rounded-lg px-3 py-2 space-y-1.5">
          {/* body-nya sudah friendly dari backend: */}
          {meta.error && (
            <p className="text-zinc-100 font-medium leading-snug">
              {meta.error}
            </p>
          )}

          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-300">
            {pair && <li>Pair: {pair}</li>}
            {networkLabel && <li>Jaringan: {networkLabel}</li>}
            {meta.order_id && <li>ID Order: #{meta.order_id}</li>}
          </ul>
        </div>
      );
    }

    // 🌐 Fallback umum: meta lain jadi key-value list, bukan JSON mentah
    if (Object.keys(meta).length > 0) {
      return (
        <div className="text-[11px] bg-zinc-900/70 border border-zinc-800 rounded-lg px-3 py-2 space-y-0.5 text-zinc-200">
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
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4">
        <GlobalHeader
          title="Notifikasi"
          subtitle="Riwayat aktivitas akun"
          onBack={() => navigate(-1)}
          theme={theme}
          unreadCount={unreadCount}
        />
      </div>

      <div className="px-4 pb-20">
        {!loading && !error && items.length > 0 && unreadCount > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] px-3 py-1 rounded-full border border-zinc-700 text-zinc-200 bg-zinc-900/70"
            >
              Tandai semua telah dibaca
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6 text-xs text-zinc-400">Memuat notifikasi...</div>
        )}

        {!loading && error && (
          <div className="mt-6 text-xs text-red-400">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-8 text-xs text-zinc-500 text-center">
            Belum ada notifikasi.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-4 space-y-3">
            {items.map((n) => {
              const style = NOTIFICATION_STYLES[n.type] || {
                label: n.type || "Notifikasi",
                icon: null,
                pillBg: "bg-zinc-700/40",
                pillText: "text-zinc-200",
                pillBorder: "border border-zinc-600/60",
              };

              return (
                <button
                  key={n.id}
                  className="w-full text-left"
                  onClick={() => handleClickNotification(n)}
                >
                  <div
                    className={`
                      rounded-2xl px-3 py-2.5 text-xs border
                      ${
                        isAmoled
                          ? "border-zinc-800 bg-zinc-950"
                          : "border-zinc-800 bg-zinc-900/70"
                      }
                      ${
                        !n.is_read
                          ? "shadow-[0_0_0_1px_rgba(34,197,94,0.25)]"
                          : ""
                      }
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
                            {!n.is_read && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </span>
                        </div>

                        <p className="mt-1 font-semibold text-zinc-50">
                          {n.title}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                          {n.body}
                        </p>

                        {n.type === "reward" && n.metadata?.amount && (
                          <p className="mt-1 text-[11px] text-emerald-300">
                            + Rp{" "}
                            {Number(n.metadata.amount).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>

                      {!n.is_read && (
                        <span className="mt-0.5 inline-flex items-center rounded-full bg-emerald-700/70 px-2 py-[2px] text-[10px] text-emerald-50">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {new Date(n.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div
          className={`
            fixed inset-0 z-50 flex items-center justify-center px-4
            bg-black/50 transition-opacity duration-150
            ${isDetailOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={handleCloseDetail}
        >
          <div
            className={`
              w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950
              px-4 pt-3 pb-5 shadow-lg shadow-black/40
              transition-all duration-150
              ${
                isDetailOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-1"
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Detail Notifikasi
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-[11px] text-zinc-400"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
              {(() => {
                const style = NOTIFICATION_STYLES[selected.type] || {};
                const DetailIcon = style.icon;
                return (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    {DetailIcon && (
                      <DetailIcon
                        className="w-4 h-4 text-zinc-100"
                        strokeWidth={2}
                      />
                    )}
                    <span className="font-medium">
                      {style.label || selected.type || "Notifikasi"}
                    </span>
                  </div>
                );
              })()}

              <div className="text-sm font-semibold text-zinc-50">
                {selected.title}
              </div>

              <div className="text-[13px] text-zinc-200 whitespace-pre-wrap">
                {selected.body}
              </div>

              {/* ✅ METADATA */}
              {renderMetadataDetail(selected)}

              <div className="text-[11px] text-zinc-500">
                Dibuat:{" "}
                {selected.created_at &&
                  new Date(selected.created_at).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
      )}

      <RewardConfetti show={showRewardFX} />
    </div>
  );
}
