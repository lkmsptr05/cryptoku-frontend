// src/components/ScreenLayout.jsx
import React from "react";
import GlobalHeader from "./GlobalHeader";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Layout wrapper untuk 1 screen/page.
 *
 * Props:
 * - title: string (judul header)
 * - subtitle: string (optional, text kecil di bawah title)
 * - onBack: function (optional, kalau mau munculin tombol back)
 * - children: isi halaman
 */
export default function ScreenLayout({
  title = "CryptoKu",
  subtitle,
  onBack,
  children,
}) {
  const { unreadCount } = useNotificationsBadge();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="px-4">
        <GlobalHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          theme={theme}
          onToggleTheme={toggleTheme}
          unreadCount={unreadCount}
        />
      </div>

      {/* isi halaman */}
      <main className="flex-1 px-4 pb-20">{children}</main>
    </div>
  );
}
