// src/components/TopUpModal.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * @param {{ topup: ReturnType<import("../hooks/useTopup").default> }} props
 */
export default function TopUpModal({ topup }) {
  const {
    isOpen,
    loading,
    orderId,
    qrUrl,
    qrString,
    error,
    submit,
    close,
    reset,
  } = topup;
  const [amountIdr, setAmountIdr] = useState("");
  const amountIdrNumber = amountIdr ? Number(amountIdr) : 0;
  const hasQR = !!qrUrl || !!qrString;
  const formattedAmountIdr = amountIdrNumber
    ? `Rp ${amountIdrNumber.toLocaleString("id-ID")}`
    : "";
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[92%] max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-xl"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-400/80">
                  CryptoKu
                </p>
                <h2 className="text-base font-semibold text-white">
                  Top Up via QRIS
                </h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={close}
                className="text-xs text-zinc-400 hover:text-zinc-100 rounded-full px-2 py-1 bg-zinc-900/60"
              >
                ✕
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {!hasQR ? (
                // STEP 1: Input nominal
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <label className="block text-xs text-zinc-400 mb-1">
                    Nominal (IDR)
                  </label>
                  <input
                    type="text"
                    min={1000}
                    className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white outline-none border border-zinc-700 focus:border-emerald-500/90 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                    inputMode="numeric"
                    placeholder="Rp 100.000"
                    value={formattedAmountIdr}
                    onChange={(e) => {
                      // Ambil hanya digit 0–9
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setAmountIdr(raw);
                    }}
                  />

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Minimal{" "}
                    <span className="font-semibold text-zinc-300">
                      1.000 IDR
                    </span>
                    . Biaya transaksi mengikuti ketentuan Midtrans.
                  </p>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-xl bg-red-950/60 border border-red-700/70 px-3 py-2 text-[11px] text-red-200"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    onClick={submit}
                    disabled={loading}
                    className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-300 text-sm font-semibold py-2.5 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <span className="w-4 h-4 border-2 border-emerald-100 border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading ? "Membuat QR..." : "Generate QR"}
                  </motion.button>
                </motion.div>
              ) : (
                // STEP 2: QR view
                <motion.div
                  key="qr-view"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="mt-1 mb-3">
                    <p className="text-[11px] text-zinc-400">
                      Order ID:
                      <span className="ml-1 font-mono text-[10px] text-zinc-200 break-all">
                        {orderId || "-"}
                      </span>
                    </p>
                  </div>

                  {qrUrl ? (
                    <motion.div
                      className="flex justify-center my-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="bg-white rounded-2xl p-2 shadow-lg">
                        <img
                          src={qrUrl}
                          alt="QRIS"
                          className="w-52 h-52 rounded-xl"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-4">
                      <p className="text-xs text-zinc-400 mb-2 text-center">
                        QR URL tidak tersedia. Gunakan{" "}
                        <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">
                          qr_string
                        </code>{" "}
                        untuk generate QR sendiri.
                      </p>
                      <textarea
                        className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-[10px] text-zinc-200 border border-zinc-700"
                        rows={3}
                        readOnly
                        value={qrString || ""}
                      />
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-xl bg-red-950/60 border border-red-700/70 px-3 py-2 text-[11px] text-red-200"
                    >
                      {error}
                    </motion.div>
                  )}

                  <p className="mt-2 text-[11px] text-zinc-400 text-center">
                    Scan QR ini menggunakan aplikasi e-wallet / m-banking kamu.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={close}
                      className="flex-1 rounded-xl bg-zinc-800 text-xs text-zinc-100 py-2.5"
                    >
                      Tutup
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={reset}
                      className="flex-1 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 py-2.5"
                    >
                      Buat QR Baru
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
