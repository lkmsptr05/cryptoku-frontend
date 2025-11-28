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
import { PendingTopupProvider } from "./contexts/PendingTopupContext.jsx";
import { PendingTopupWatcher } from "./components/PendingTopupWatcher.jsx";
import { SplashScreen } from "./components/SplashScreen.jsx";

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

  // Kontrol tampilan splash (termasuk delay setelah loading selesai)
  const [showSplash, setShowSplash] = useState(true);

  // Auth ke backend pakai initData Telegram
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

  // Logic delay + fade-out splash
  useEffect(() => {
    // Kalau masih loading → splash ON
    if (isStillLoading) {
      setShowSplash(true);
      return;
    }

    // Kalau sudah tidak loading → delay sebelum splash OFF
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 600); // 600ms; bisa diubah sesuai selera

    return () => clearTimeout(timer);
  }, [isStillLoading]);

  // Selama showSplash true → tampilin SplashScreen saja
  // isFadingOut = true kalau loading sudah selesai tapi splash masih ditahan (delay)
  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen isFadingOut={!isStillLoading} />
      </ThemeProvider>
    );
  }

  // STRICT MODE: hanya boleh buka dari Telegram (tapi kamu masih render app dev di bawah ini)
  if (!authedUser) {
    return (
      <ThemeProvider>
        <PendingTopupProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#111",
                color: "#fff",
                border: "1px solid #27272a",
              },
            }}
          />

          <BrowserRouter>
            <RouterWrapper
              telegramUser={authedUser || user}
              initData={initData}
            />
          </BrowserRouter>
        </PendingTopupProvider>
      </ThemeProvider>
    );
  }

  // App normal
  return (
    <ThemeProvider>
      <PendingTopupProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              border: "1px solid #27272a",
            },
          }}
        />

        <PendingTopupWatcher />

        <BrowserRouter>
          <RouterWrapper
            telegramUser={authedUser || user}
            initData={initData}
          />
        </BrowserRouter>
      </PendingTopupProvider>
    </ThemeProvider>
  );
}
