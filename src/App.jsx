// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Order from "./pages/order";
import Market from "./pages/market";
import Profile from "./pages/profile";
import Activity from "./pages/activity";
import NotificationsPage from "./pages/notifications";
import BalanceHistoryPage from "./pages/balance-history.jsx";

import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./contexts/ThemeContext";
import useTelegramAuth from "./hooks/useTelegramAuth";
import { API_BASE_URL } from "./config/api";
import { Toaster } from "react-hot-toast";

/* -------------------- Page Transition (simple fade) -------------------- */
function PageTransition({ children }) {
  return (
    <div
      style={{
        animation: "fadeOpacity 500ms ease",
      }}
    >
      {children}
    </div>
  );
}

/* -------------------- Router Wrapper -------------------- */
function RouterWrapper({ telegramUser, initData }) {
  const location = useLocation();

  return (
    <>
      <PageTransition key={location.pathname}>
        <Toaster position="top-center" />
        <Routes location={location}>
          <Route
            path="/"
            element={<Home telegramUser={telegramUser} initData={initData} />}
          />
          <Route
            path="/market"
            element={<Market telegramUser={telegramUser} initData={initData} />}
          />
          <Route
            path="/activity"
            element={
              <Activity telegramUser={telegramUser} initData={initData} />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile telegramUser={telegramUser} initData={initData} />
            }
          />
          <Route
            path="/order/:symbol"
            element={<Order telegramUser={telegramUser} initData={initData} />}
          />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/balance/history" element={<BalanceHistoryPage />} />
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

    const run = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);
        const res = await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-telegram-init-data": initData,
          },
          body: JSON.stringify({ initData }),
        });

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

  // STRICT MODE: hanya boleh buka dari Telegram
  if (!authedUser) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 text-center">
          <div className="max-w-sm w-full space-y-4">
            <h1 className="text-xl font-semibold text-red-400">
              Akses Ditolak
            </h1>

            <p className="text-sm text-gray-400">
              CryptoKu hanya bisa dibuka melalui aplikasi Telegram.
            </p>

            <p className="text-xs text-gray-500">
              Buka bot resmi kami lalu tekan tombol <b>Open App</b>
            </p>

            <a
              href="https://t.me/GoCryptoku_bot"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
            >
              Buka di Telegram
            </a>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // App normal
  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouterWrapper telegramUser={authedUser || user} initData={initData} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
