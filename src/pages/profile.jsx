import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import BannerBox from "../components/BannerBox";
import { getMe } from "../services/api";
import { useNavigate } from "react-router-dom";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import useMe from "../hooks/useMe";
import TopupSnapModal from "../components/TopupSnapModal";

export default function Profile() {
  const { amoled, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsBadge();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [openTopup, setOpenTopup] = useState(false);
  // Scroll behavior (optional, bisa sama kayak Home)
  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 10 && currentY > 32) {
        setShowHeader(false);
      } else if (currentY < lastScrollY.current - 10) {
        setShowHeader(true);
      }
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { me, loading, error } = useMe();
  const bgClass = amoled
    ? "bg-black"
    : "bg-gradient-to-b from-zinc-900 to-black";

  const user = me?.user;
  const balance = me?.balance || {};

  const available = balance.balance_available || 0;
  const locked = balance.balance_locked || 0;
  const totalNow = available + locked;
  const totalIn = balance.balance_total_in || 0;
  const totalOut = balance.balance_total_out || 0;

  const wallets = me?.wallets || [];

  function formatRupiah(amount = 0) {
    try {
      return amount.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      });
    } catch {
      return `Rp ${amount}`;
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const displayName =
    (user?.first_name || "") + (user?.last_name ? ` ${user.last_name}` : "") ||
    user?.username ||
    "User";

  const avatarLetter =
    displayName && displayName.trim().length > 0
      ? displayName.trim()[0].toUpperCase()
      : "U";

  const cardBaseClass = amoled
    ? "bg-zinc-950/80 border-zinc-900"
    : "bg-zinc-900/80 border-zinc-800";

  return (
    <div className={`min-h-screen px-4 pt-16 pb-28 ${bgClass} text-white`}>
      {/* ===========================
          FLOATING HEADER
      ============================ */}
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full mx-auto pointer-events-auto">
          <div
            className={`rounded-b-lg px-5 border backdrop-blur-md shadow-md
              ${
                amoled
                  ? "bg-black/85 border-zinc-900"
                  : "bg-zinc-900/85 border-zinc-800"
              }
            `}
            style={{
              transform: showHeader ? "translateY(0)" : "translateY(-100%)",
              opacity: showHeader ? 1 : 0,
              transition: "transform 0.35s ease, opacity 0.5s ease",
            }}
          >
            <GlobalHeader
              title="Profile"
              subtitle="Profile pengguna CryptoKu"
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>

      <main className="mt-3 space-y-4">
        <BannerBox
          label="Profile pengguna"
          title={user ? `Halo, ${displayName}` : "Memuat profil..."}
          description="Lihat dan kelola informasi akun dan saldo kamu di sini."
          accent="emerald"
        />

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="mt-2 text-xs text-red-400 bg-red-900/30 border border-red-700/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* SKELETON LOADING STATE */}
        {loading && !error && (
          <>
            {/* USER CARD SKELETON */}
            <section
              className={`mt-2 rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-zinc-800" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3 w-32 bg-zinc-800 rounded" />
                  <div className="h-3 w-20 bg-zinc-800 rounded" />
                  <div className="h-3 w-40 bg-zinc-900 rounded" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-zinc-400 animate-pulse">
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-zinc-800 rounded" />
                  <div className="h-3 w-28 bg-zinc-900 rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                  <div className="h-3 w-32 bg-zinc-900 rounded" />
                </div>
              </div>
            </section>

            {/* BALANCE CARD SKELETON */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center justify-between mb-2 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                  <div className="h-5 w-28 bg-zinc-900 rounded" />

                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between gap-4">
                      <div className="h-3 w-16 bg-zinc-800 rounded" />
                      <div className="h-3 w-20 bg-zinc-900 rounded" />
                    </div>
                    <div className="flex justify-between gap-4">
                      <div className="h-3 w-20 bg-zinc-800 rounded" />
                      <div className="h-3 w-24 bg-zinc-900 rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="h-7 w-20 rounded-full bg-zinc-800" />
                  <div className="h-7 w-20 rounded-full bg-zinc-800" />
                </div>
              </div>

              <div className="mt-2 space-y-2 animate-pulse">
                <div className="h-3 w-full bg-zinc-900 rounded" />
                <div className="h-3 w-3/4 bg-zinc-900 rounded" />
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] text-zinc-500 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                  <div className="h-3 w-20 bg-zinc-900 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                  <div className="h-3 w-20 bg-zinc-900 rounded" />
                </div>
              </div>
            </section>

            {/* WALLETS SKELETON */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center justify-between mb-3 animate-pulse">
                <div className="h-3 w-28 bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-900 rounded" />
              </div>

              <div className="space-y-2 animate-pulse">
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-zinc-800 rounded" />
                    <div className="h-3 w-40 bg-zinc-900 rounded" />
                    <div className="h-3 w-20 bg-zinc-900 rounded" />
                  </div>
                  <div className="h-6 w-14 rounded-lg bg-zinc-800" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-zinc-800 rounded" />
                    <div className="h-3 w-40 bg-zinc-900 rounded" />
                    <div className="h-3 w-20 bg-zinc-900 rounded" />
                  </div>
                  <div className="h-6 w-14 rounded-lg bg-zinc-800" />
                </div>
              </div>
            </section>

            {/* SETTINGS SKELETON */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="mb-3 animate-pulse">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>

              <div className="flex items-center justify-between py-2 animate-pulse">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-zinc-800 rounded" />
                  <div className="h-3 w-32 bg-zinc-900 rounded" />
                </div>
                <div className="h-7 w-20 rounded-full bg-zinc-800" />
              </div>

              <div className="mt-3 border-t border-zinc-800 pt-3 animate-pulse">
                <div className="h-3 w-40 bg-zinc-900 rounded" />
              </div>
            </section>
          </>
        )}

        {/* NORMAL CONTENT (SETELAH LOADING) */}
        {!loading && !error && me && (
          <>
            {/* USER CARD */}
            <section
              className={`mt-2 rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-lg font-semibold">
                    {avatarLetter}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {displayName}
                  </div>
                  {user?.username && (
                    <div className="text-xs text-zinc-400 truncate">
                      @{user.username}
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 mt-1">
                    ID Telegram: <span className="font-mono">{user?.id}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
                <div>
                  <div className="text-zinc-500">Bergabung</div>
                  <div className="text-xs text-zinc-200">
                    {formatDate(user?.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Terakhir aktif</div>
                  <div className="text-xs text-zinc-200">
                    {formatDate(user?.last_login)}
                  </div>
                </div>
              </div>
            </section>

            {/* BALANCE CARD */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Saldo Tersedia
                  </div>
                  <div className="text-lg font-semibold">
                    {formatRupiah(available)}
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] text-zinc-400">
                    <div className="flex justify-between gap-4">
                      <span>Terkunci</span>
                      <span className="text-zinc-200">
                        {formatRupiah(locked)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Total sekarang</span>
                      <span className="text-zinc-200">
                        {formatRupiah(totalNow)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    type="button"
                    className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                    onClick={() => setOpenTopup(true)}
                  >
                    Top Up
                  </button>
                  <TopupSnapModal
                    open={openTopup}
                    onClose={() => setOpenTopup(false)}
                  />
                  <button
                    type="button"
                    className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200"
                    onClick={() => navigate("/balance/history")}
                  >
                    Riwayat
                  </button>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-zinc-500">
                Saldo tersedia bisa langsung dipakai untuk pembelian aset di
                CryptoKu. Saldo terkunci adalah dana yang sedang digunakan di
                order berjalan atau transaksi lain yang belum selesai.
              </div>

              {/* Ringkasan lifetime (opsional, pakai total_in & total_out) */}
              <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
                <div className="flex justify-between">
                  <span>Total dana masuk</span>
                  <span className="text-emerald-300">
                    {formatRupiah(totalIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total dana keluar</span>
                  <span className="text-amber-300">
                    {formatRupiah(totalOut)}
                  </span>
                </div>
              </div>
            </section>

            {/* WALLETS */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Wallet Address</div>
                <span className="text-[11px] text-zinc-500">
                  {wallets.length} address
                </span>
              </div>

              {wallets.length === 0 ? (
                <div className="text-[11px] text-zinc-500">
                  Kamu belum punya alamat wallet tercatat. Nanti akan muncul di
                  sini jika sudah ada fitur withdraw / deposit on-chain.
                </div>
              ) : (
                <div className="space-y-2">
                  {wallets.map((w) => (
                    <div
                      key={`${w.asset}-${w.address}`}
                      className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"
                    >
                      <div>
                        <div className="text-xs font-medium">
                          {w.asset || "ASSET"}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px]">
                          {w.address}
                        </div>
                        {w.network && (
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {w.network}
                          </div>
                        )}
                      </div>
                      {/* placeholder tombol copy */}
                      <button
                        type="button"
                        className="text-[11px] px-2 py-1 rounded-lg border border-zinc-700 text-zinc-300"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(w.address)
                            .catch(() => {});
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SETTINGS */}
            <section
              className={`rounded-2xl border px-4 py-4 ${cardBaseClass}`}
            >
              <div className="text-sm font-medium mb-2">Pengaturan</div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs">Tema</div>
                  <div className="text-[11px] text-zinc-500">
                    Ganti antara Dark dan Amoled
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700"
                >
                  {amoled ? "Amoled" : "Dark"}
                </button>
              </div>

              <div className="mt-3 border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
                CryptoKu · versi 0.1.0 (beta)
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
