// src/hooks/useTopup.js
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../config/api";

function getInitData() {
  const tgWebApp = window.Telegram?.WebApp;
  return tgWebApp?.initData || "";
}

/**
 * Hook untuk meng-handle flow Top Up QRIS
 *
 * Usage di page:
 *   const topup = useTopup();
 *   <button onClick={topup.open}>Top Up</button>
 *   <TopUpModal topup={topup} />
 */
export default function useTopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [amountIdr, setAmountIdr] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrString, setQrString] = useState(null);
  const [error, setError] = useState(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setAmountIdr("");
    setLoading(false);
    setOrderId(null);
    setQrUrl(null);
    setQrString(null);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    try {
      setError(null);

      const parsed = Number(amountIdr);
      if (!parsed || parsed <= 0) {
        throw new Error("Nominal top up tidak valid.");
      }
      if (parsed < 1000) {
        throw new Error("Minimal top up 1.000 IDR.");
      }

      const initData = getInitData();
      if (!initData) {
        throw new Error(
          "Telegram initData tidak ditemukan. Pastikan dibuka dari tombol WebApp di bot."
        );
      }

      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/topup/qris`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify({ amount: parsed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          data?.detail?.status_message ||
          "Gagal membuat QRIS.";
        throw new Error(msg);
      }

      setOrderId(data.order_id || null);
      setQrUrl(data.qr_url || null);
      setQrString(data.qr_string || null);
    } catch (err) {
      console.error("[Topup] error:", err);
      setError(err.message || "Terjadi kesalahan saat membuat QR.");
    } finally {
      setLoading(false);
    }
  }, [amountIdr]);

  const reset = useCallback(() => {
    setAmountIdr("");
    setOrderId(null);
    setQrUrl(null);
    setQrString(null);
    setError(null);
  }, []);

  return {
    // state
    isOpen,
    amountIdr,
    loading,
    orderId,
    qrUrl,
    qrString,
    error,

    // actions
    open,
    close,
    submit,
    setAmountIdr,
    reset,
  };
}
