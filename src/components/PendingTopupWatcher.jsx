import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { authedGet } from "../services/request";
import { usePendingTopup } from "../contexts/pendingTopupContext.jsx";

// Haptic helper
function triggerHaptic(type = "warning") {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic) return;

  try {
    if (type === "impact") {
      haptic.impactOccurred("medium");
    } else {
      haptic.notificationOccurred(type); // success | warning | error
    }
  } catch {}
}

export function PendingTopupWatcher({
  intervalMs = 30000,
  autoCloseMs = 6000,
}) {
  const { pendingCount, setPendingCount, isTopupTabActive } = usePendingTopup();

  const lastCountRef = useRef(pendingCount);

  useEffect(() => {
    let cancelled = false;

    async function checkPending() {
      try {
        const { data } = await authedGet(
          "/topup/history?status=pending&limit=5"
        );

        if (cancelled) return;

        const items = data?.items || [];
        const valid = items.filter((x) => !!x.snap_token);

        const count = valid.length;
        setPendingCount(count);

        const prev = lastCountRef.current;

        // --- BARU ADA pending (0 -> >0) & tidak di tab topup ---
        if (prev === 0 && count > 0 && !isTopupTabActive) {
          const latest = valid[0];

          triggerHaptic("warning");

          toast(
            (t) => (
              <button
                type="button"
                onClick={() => {
                  if (!latest?.snap_token || !window.snap) return;

                  triggerHaptic("impact");

                  window.snap.pay(latest.snap_token, {
                    onSuccess: () => {
                      toast.dismiss(t.id);
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
                }}
                className="flex gap-3 items-start text-left"
              >
                <div className="text-lg">⚡</div>
                <div className="flex-1 text-xs">
                  <p className="font-medium text-zinc-100">
                    Ada {count} transaksi top up pending
                  </p>
                  <p className="mt-1 text-zinc-400 leading-snug">
                    Top up{" "}
                    <span className="font-semibold text-white">
                      Rp {Number(latest.amount || 0).toLocaleString("id-ID")}
                    </span>{" "}
                    belum selesai. Ketuk untuk lanjutkan.
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    #{latest.order_id?.slice(-8)}
                  </p>
                </div>
              </button>
            ),
            {
              id: "pending-topup",
              duration: autoCloseMs,
              position: "top-center",
              style: {
                background: "#111",
                color: "#fff",
                border: "1px solid #27272a",
                maxWidth: "360px",
              },
            }
          );
        }

        // --- kalau sekarang sudah 0, pastikan toast ditutup ---
        if (prev > 0 && count === 0) {
          toast.dismiss("pending-topup");
        }

        lastCountRef.current = count;
      } catch (err) {
        console.error("[PendingTopupWatcher] error:", err);
      }
    }

    checkPending();
    const timer = setInterval(checkPending, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [setPendingCount, isTopupTabActive, intervalMs, autoCloseMs]);

  return null;
}
