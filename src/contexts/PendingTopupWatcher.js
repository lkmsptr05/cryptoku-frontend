import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { authedGet } from "../services/request";
import { usePendingTopup } from "../context/PendingTopupContext.jsx";

// Haptic helper Telegram
function triggerHaptic(type = "warning") {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic) return;

  try {
    if (type === "impact") {
      haptic.impactOccurred("medium");
    } else {
      // success | warning | error
      haptic.notificationOccurred(type);
    }
  } catch {}
}

/**
 * Komponen global:
 * - cek pending topup berkala
 * - munculin toast react-hot-toast
 * - update pendingCount di context (buat badge tab Activity)
 */
export default function PendingTopupWatcher({
  intervalMs = 30000,
  autoCloseMs = 6000,
}) {
  const { pendingCount, setPendingCount, isTopupTabActive } = usePendingTopup();

  const lastCountRef = useRef(pendingCount);
  const autoHideTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function checkPending() {
      try {
        const { data } = await authedGet(
          "/api/topup/history?status=pending&limit=5"
        );

        if (cancelled) return;

        const items = data?.items || [];
        const valid = items.filter((x) => !!x.snap_token);

        const count = valid.length;
        setPendingCount(count);

        const prev = lastCountRef.current;

        // --- BARU ADA PENDING (0 -> >0) & BUKAN di tab topup ---
        if (prev === 0 && count > 0 && !isTopupTabActive) {
          const latest = valid[0];

          // kalau toast masih aktif, jangan bikin baru
          if (!toast.isActive("pending-topup")) {
            triggerHaptic("warning");

            toast(
              `⚡ Ada ${count} transaksi top up pending\n` +
                `Rp ${Number(latest.amount || 0).toLocaleString("id-ID")}\n` +
                `Tap untuk lanjutkan`,
              {
                id: "pending-topup",
                duration: Infinity, // kita atur sendiri auto-hide
                position: "top-center",
                style: {
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #27272a",
                  whiteSpace: "pre-line", // biar \n jadi multiline
                },
                onClick: () => {
                  if (!latest?.snap_token || !window.snap) return;

                  triggerHaptic("impact");

                  window.snap.pay(latest.snap_token, {
                    onSuccess: () => {
                      toast.dismiss("pending-topup");
                      toast.success("✅ Top up berhasil", {
                        style: {
                          background: "#111",
                          color: "#fff",
                          border: "1px solid #27272a",
                        },
                      });
                    },
                    onPending: () => {},
                    onError: () => {
                      toast.error("⚠️ Gagal membuka pembayaran", {
                        style: {
                          background: "#111",
                          color: "#fff",
                          border: "1px solid #27272a",
                        },
                      });
                    },
                  });
                },
              }
            );

            // auto-hide manual
            if (autoHideTimerRef.current) {
              clearTimeout(autoHideTimerRef.current);
            }
            autoHideTimerRef.current = setTimeout(() => {
              toast.dismiss("pending-topup");
            }, autoCloseMs);
          }
        }

        // --- SUDAH TIDAK ADA PENDING ---
        if (prev > 0 && count === 0) {
          toast.dismiss("pending-topup");
          if (autoHideTimerRef.current) {
            clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
          }
        }

        lastCountRef.current = count;
      } catch (err) {
        console.error("[PendingTopupWatcher] error:", err);
      }
    }

    checkPending();
    const timer = setInterval(checkPending, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [setPendingCount, isTopupTabActive, intervalMs, autoCloseMs]);

  return null;
}
