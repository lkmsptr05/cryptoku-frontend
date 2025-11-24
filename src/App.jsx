// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Order from "./pages/order";
import Market from "./pages/market";
import Profile from "./pages/profile";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./contexts/ThemeContext";
import useTelegramAuth from "./hooks/useTelegramAuth"; // pastikan path ini sesuai struktur proyekmu

/* -------------------- Page Transition -------------------- */
function PageTransition({ children }) {
  return (
    <div
      style={{
        animation: "fadeIn 240ms ease",
      }}
    >
      {children}
    </div>
  );
}

/* -------------------- Router Wrapper -------------------- */
/**
 * RouterWrapper sekarang menerima `telegramUser` sebagai props
 * supaya bisa diteruskan ke <Home />.
 */
function RouterWrapper({ telegramUser }) {
  const location = useLocation();

  return (
    <>
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home telegramUser={telegramUser} />} />
          <Route path="/market" element={<Market />} />
          <Route path="/order" element={<Order />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </PageTransition>
      <BottomNav />
    </>
  );
}

/* -------------------- MAIN App -------------------- */

export default function App() {
  const { user, initData, loading } = useTelegramAuth();

  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authedUser, setAuthedUser] = useState(null);

  useEffect(() => {
    // masih nunggu hook Telegram
    if (loading) return;

    // kalau bukan dibuka dari Telegram (dev di browser biasa)
    if (!initData || !user) {
      console.warn("[Auth] Tidak ada initData / user Telegram. Mode dev?");
      setAuthedUser(null);
      setAuthLoading(false);
      return;
    }

    // kirim initData ke backend untuk diverifikasi & disimpan
    const run = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);

        const res = await fetch(
          "https://cryptoku-backend-beige.vercel.app/api/auth/telegram",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ initData }),
          }
        );

        const json = await res.json();

        if (!res.ok || !json?.success) {
          console.error("[Auth] Backend auth failed:", json);
          setAuthError("Gagal autentikasi dengan Telegram.");
          setAuthedUser(null);
        } else {
          // simpan user yang sudah diverifikasi backend
          setAuthedUser(json.user || user);
        }
      } catch (err) {
        console.error("[Auth] Error:", err);
        setAuthError("Terjadi kesalahan saat koneksi server.");
        setAuthedUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    run();
  }, [loading, initData, user]);

  const isStillLoading = loading || authLoading;

  if (isStillLoading) {
    // layar loading global saat pertama kali buka App
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-zinc-400">Menghubungkan ke Telegram...</p>
        </div>
      </ThemeProvider>
    );
  }

  // Kalau mau strict: bisa blokir akses kalau authError != null
  // Untuk sekarang: cuma kasih warning, app tetap bisa jalan
  // Nanti bisa kamu ganti sesuai kebutuhan (misal harus Telegram only)
  return (
    <ThemeProvider>
      <BrowserRouter>
        {authError && (
          <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
            <div className="max-w-md mx-auto text-xs text-amber-300 bg-amber-900/30 border border-amber-700/60 rounded-xl px-3 py-2">
              {authError} · App tetap bisa dibuka, tetapi beberapa fitur mungkin
              terbatas.
            </div>
          </div>
        )}

        <RouterWrapper telegramUser={authedUser || user || null} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
