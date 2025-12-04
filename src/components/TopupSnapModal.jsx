import React, { useEffect, useState } from "react";
import { authedPost } from "../services/request";

import toast from "react-hot-toast";

/**
 * Popup Top Up via Midtrans Snap
 *
 * Props:
 * - open: boolean
 * - onClose: function
 */
export default function TopupSnapModal({ open, onClose }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snapReady, setSnapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.snap) {
      setSnapReady(true);
      return;
    }

    const timer = setInterval(() => {
      if (window.snap) {
        setSnapReady(true);
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  if (!open) return null;

  const handleChangeAmount = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const formattedAmount =
    amount && Number(amount)
      ? `Rp ${Number(amount).toLocaleString("id-ID")}`
      : "";

  const handleSubmit = async () => {
    try {
      setError("");

      const parsed = Number(amount);

      if (!parsed || parsed <= 0) {
        throw new Error("Nominal top up belum valid.");
      }

      if (parsed < 1000) {
        throw new Error("Minimal top up adalah Rp 1.000");
      }

      // Pastikan lewat Telegram WebApp
      if (!window.Telegram?.WebApp?.initData) {
        throw new Error(
          "Silakan buka CryptoKu melalui Telegram WebApp (via bot)."
        );
      }

      setLoading(true);

      const { res, data } = await authedPost("/topup/snap", {
        amount: parsed,
      });

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Gagal membuat transaksi. Silakan coba lagi."
        );
      }

      const { snap_token, redirect_url } = data;

      // Pakai popup Snap
      if (window.snap && snap_token) {
        window.snap.pay(snap_token, {
          onSuccess: function (result) {
            console.log("[Snap] success", result);

            try {
              window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(
                "success"
              );
            } catch (e) {}

            onClose();

            toast.success(
              `Topup saldo sebesar Rp ${parsed.toLocaleString(
                "id-ID"
              )} berhasil!`,
              {
                duration: 2500, // ✅ Paksa auto-close 2.5 detik (bebas mau 2000/3000)
                style: {
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #27272a",
                },
              }
            );
          },

          onPending: function (result) {
            console.log("[Snap] pending", result);
          },

          onError: function (result) {
            console.error("[Snap] error", result);
            setError("Terjadi kesalahan saat pembayaran. Silakan coba lagi.");
          },

          onClose: function () {
            console.log("[Snap] popup ditutup user");
          },
        });
      } else if (redirect_url) {
        window.location.href = redirect_url;
      } else {
        throw new Error("Snap belum siap. Coba lagi sebentar.");
      }
    } catch (err) {
      console.error("[TopupSnapModal]", err);
      setError(err?.message || "Terjadi kesalahan saat top up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 px-5 py-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Top Up Saldo</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 -mt-1">
          Masukkan nominal yang ingin kamu top up
        </p>

        {/* Input */}
        <input
          type="text"
          inputMode="numeric"
          placeholder="Rp 50.000"
          value={formattedAmount}
          onChange={handleChangeAmount}
          className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white outline-none border border-zinc-700 focus:border-emerald-500 transition-all"
        />

        <p className="text-[10px] text-zinc-500">
          Minimal <span className="text-zinc-300 font-semibold">1.000 IDR</span>
        </p>

        {error && (
          <p className="text-[11px] text-amber-400 whitespace-pre-line">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            w-full py-3 mt-1 rounded-2xl text-sm font-semibold
            bg-emerald-500 text-black
            hover:bg-emerald-400
            disabled:bg-emerald-900 disabled:text-emerald-300
            transition-all
          "
        >
          {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
        </button>

        {!snapReady && (
          <p className="text-[9px] text-zinc-500 text-center">
            Menyiapkan sistem pembayaran…
          </p>
        )}
      </div>
    </div>
  );
}
