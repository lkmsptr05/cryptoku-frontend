// ===============================
// src/pages/Home.jsx
// ===============================
import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import SystemHealthPopup from "../components/SystemHealthPopup";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import useTopup from "../hooks/useTopup";
// import TopUpModal from "../components/TopupModal";
import { useNavigate } from "react-router-dom";
import useMyBalance from "../hooks/useMyBalance";
import useSystemHealth from "../hooks/useSystemHealth";
import useTopGainers from "../hooks/useTopGainers";
import useCryptoNews from "../hooks/useCryptoNews";
import useMarketIndex from "../hooks/useMarketIndex";
import TopupSnapModal from "../components/TopupSnapModal";

const formatIDR = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "Rp0";
  return num.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
};

// Home sekarang menerima telegramUser dari App.jsx
export default function Home({ telegramUser, initData }) {
  const topup = useTopup();
  const navigate = useNavigate();
  const [openTopup, setOpenTopup] = useState(false);

  const { amoled, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationsBadge();
  const [showPopup, setShowPopup] = useState(false);

  // NEWS
  const [newsTab, setNewsTab] = useState("all");

  const { health } = useSystemHealth();
  const { gainers } = useTopGainers(3);
  const { marketIndex } = useMarketIndex();

  const { news, loading: newsLoading, error: newsError } = useCryptoNews();
  const FRONTEND_PLACEHOLDER = "/assets/no-image-placeholder.png";

  // hide saldo
  const [hideBalance, setHideBalance] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("cryptoku_hide_balance") === "1";
  });

  // =============================
  // FLOATING HEADER STATE
  // =============================
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // =============================
  // FORMAT PAIR (ethusdt → ETH/USDT)
  // =============================
  const formatPair = (symbol) =>
    symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1");

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useMyBalance(telegramUser?.id);

  // =============================
  // HIDE BALANCE
  // =============================
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "cryptoku_hide_balance",
      hideBalance ? "1" : "0"
    );
  }, [hideBalance]);

  // =============================
  // SCROLL LISTENER UNTUK FLOATING HEADER
  // =============================
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;

      if (currentY < 16) {
        setShowHeader(true);
        lastScrollY.current = currentY;
        return;
      }

      const diff = currentY - lastScrollY.current;

      // scroll turun → sembunyikan
      if (diff > 4 && currentY > 40) {
        setShowHeader(false);
      }
      // scroll naik → tampilkan lagi
      else if (diff < -4) {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const name =
    telegramUser?.first_name || telegramUser?.username || "Pengguna CryptoKu";

  const username = telegramUser?.username ? `@${telegramUser.username}` : null;
  const avatar = telegramUser?.photo_url
    ? telegramUser?.photo_url
    : "/default-profile.png";

  const handleHistory = () => {
    console.log("History saldo clicked");
    // contoh:
    // navigate("/profile", { state: { section: "balance-history" } });
  };

  const filteredNews = news.filter((item) => {
    if (newsTab === "all") return true;

    const text = (
      (item.title_id || item.title || "") +
      " " +
      (item.description_id || item.description || "")
    ).toLowerCase();

    if (newsTab === "bitcoin") {
      return text.includes("bitcoin") || text.includes("btc");
    }
    if (newsTab === "ethereum") {
      return text.includes("ethereum") || text.includes("eth");
    }
    if (newsTab === "defi") {
      return (
        text.includes("defi") || text.includes("de-fi") || text.includes("nft")
      );
    }
    return true;
  });

  function getNewsCategory(item) {
    const text = (
      (item.title_id || item.title || "") +
      " " +
      (item.description_id || item.description || "")
    ).toLowerCase();

    if (text.includes("bitcoin") || text.includes("btc")) return "BTC";
    if (text.includes("ethereum") || text.includes("eth")) return "ETH";
    if (text.includes("defi") || text.includes("nft")) return "DeFi/NFT";
    return "Umum";
  }

  function isBreaking(item) {
    if (!item.publishedAt) return false;
    const published = new Date(item.publishedAt).getTime();
    if (Number.isNaN(published)) return false;
    const diffMs = Date.now() - published;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 2; // ≤ 2 jam => Breaking
  }

  return (
    <div
      className={`animate-fade min-h-screen px-4 pt-16 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-950 to-black"
      } text-white pb-32`}
    >
      {/* ===========================
          FLOATING GLOBAL HEADER
      ============================ */}
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full mx-auto pointer-events-auto">
          <div
            className={`
              rounded-b-lg px-5 border
              backdrop-blur-md
              shadow-md
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
              title="CryptoKu"
              subtitle="Beranda"
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>

      {/* ===========================
          PAGE CONTENT
      ============================ */}
      <div className="max-w-md mx-auto space-y-5">
        {/* ====== BANNER: NAMA + SALDO + TOMBOL ====== */}

        <section className="mt-6">
          <div
            className={`
              w-full rounded-3xl p-4 border
              shadow-md
              ${
                amoled
                  ? "bg-black/60 border-zinc-800"
                  : "bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-emerald-900/40 border-zinc-800/80"
              }
            `}
          >
            {/* baris atas: salam + username + avatar */}
            <div className="flex justify-between">
              <div className="flex items-start justify-between">
                {/* KIRI: Greeting + fullname saja */}
                <div>
                  <p className="text-sm text-zinc-400">Selamat datang,</p>
                  <p className="text-lg font-semibold">{name}</p>
                </div>

                {/* KANAN: Foto + Username di bawahnya */}
              </div>

              <div className="flex flex-col items-center text-center">
                <img
                  src={avatar}
                  alt="Avatar"
                  onError={(e) => {
                    e.currentTarget.src = "/default-profile.png";
                  }}
                  className="w-16 h-16 rounded-full object-cover border border-zinc-700"
                />

                {username && (
                  <p className="text-[11px] text-zinc-400">{username}</p>
                )}
              </div>
            </div>

            {/* saldo */}
            <div>
              {/* Label */}
              <p className="text-[11px] text-zinc-400">Saldo IDR</p>

              {/* Baris: Saldo + icon mata */}
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold tracking-tight">
                  {balanceLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      <span className="text-zinc-400 text-[13px]">
                        Memuat saldo...
                      </span>
                    </span>
                  ) : hideBalance ? (
                    "••••••"
                  ) : (
                    formatIDR(balance)
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => setHideBalance((v) => !v)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full
                
                 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800
                 transition-colors"
                >
                  {hideBalance ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {balanceError && (
                <p className="text-[11px] text-amber-400 mt-1">
                  {balanceError}
                </p>
              )}
            </div>

            {/* tombol */}
            <div className="flex items-center gap-2 mt-2">
              {/* <button
                onClick={() => setOpenTopup(true)}
                className="
      flex-1 py-2 rounded-2xl text-xs font-semibold
      bg-emerald-500 text-black
      hover:bg-emerald-400 transition
    "
              >
                Top Up
              </button> */}
              <button
                type="button"
                onClick={() => setOpenTopup(true)}
                className="flex-1 py-2 rounded-2xl text-xs font-semibold 
                  bg-emerald-500 text-black
                  hover:bg-emerald-400
                  active:scale-[0.97]
                  transition-transform duration-150"
              >
                Top Up Saldo
              </button>
              {/* <TopUpModal topup={topup} /> */}
              <TopupSnapModal
                open={openTopup}
                onClose={() => setOpenTopup(false)}
              />
              <button
                type="button"
                onClick={() => navigate("/balance/history")}
                className="flex-1 py-2 rounded-2xl text-xs font-medium 
                  border border-zinc-700
                  text-zinc-200 bg-zinc-900/60
                  hover:bg-zinc-800
                  active:scale-[0.97]
                  transition-transform duration-150"
              >
                Riwayat Saldo
              </button>
            </div>
          </div>
        </section>

        {/* Health + Index */}
        <div className="grid grid-cols-2 gap-3">
          {/* System Health */}
          <button
            onClick={() => setShowPopup(true)}
            className={`group rounded-2xl border border-zinc-800 p-4 shadow-md text-left transition transform hover:-translate-y-[1px] hover:border-zinc-700 ${
              amoled
                ? "bg-black/40"
                : "bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-emerald-900/40 border-zinc-800/80"
            }`}
          >
            <div className="text-xs text-zinc-400 mb-1 flex items-center justify-between">
              <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">
                System Health
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-[2px] text-[10px] text-emerald-400 border border-emerald-500/30">
                Live
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
            <p className="text-emerald-400 text-xl font-bold">OK</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Tap untuk detail status sistem
            </p>
          </button>

          {/* Index Crypto */}
          <div
            className={`rounded-2xl border border-zinc-800 p-4 shadow-md transition ${
              amoled ? "bg-black/40" : "bg-zinc-900/80"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">
                CryptoKu Index
              </p>

              <span className={`${marketIndex.style}`}>
                {marketIndex.sentiment}
                <span className={marketIndex.animate} />
              </span>
            </div>

            {/* Index value */}
            <div className="flex items-end gap-2">
              <p
                className={`text-xl font-bold ${marketIndex.color} tracking-tight`}
              >
                {marketIndex.arrow} {marketIndex.index}%
              </p>
              <span className="text-[11px] text-zinc-500 mb-[2px]">
                / 24 jam
              </span>
            </div>

            {/* Progress Indicator bar */}
            <div className="mt-2 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full ${
                  marketIndex.index >= 0
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                    : "bg-gradient-to-r from-red-500 to-rose-300"
                }`}
                style={{
                  width: `${Math.min(Math.abs(marketIndex.index) * 10, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ======================
            REAL TOP 3 GAINERS
        ======================= */}
        {/* ======================
    REAL TOP 3 GAINERS
======================= */}
        <div
          className={`rounded-2xl border border-zinc-800 shadow-md overflow-hidden ${
            amoled ? "bg-black/40" : "bg-zinc-900/80"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800/70">
            <div>
              <p className="text-xs text-zinc-400 mb-1 uppercase tracking-[0.18em]">
                Top Gainers
              </p>
              <p className="text-sm text-zinc-300">
                3 token dengan kenaikan tertinggi 24 jam
              </p>
            </div>
            <span className="text-[10px] px-2 py-[3px] rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              24H
            </span>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-0">
            {gainers.map((t, i) => (
              <div
                key={i}
                className={`rounded-b-2xl border-b border-zinc-800 ${
                  amoled ? "bg-black/40" : "bg-zinc-900/80"
                } p-4`}
              >
                {/* BARIS ATAS */}
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-zinc-100">
                    {formatPair(t.symbol)}
                  </p>

                  <p className="font-semibold text-sm text-zinc-100">
                    ${t.price_usd}
                  </p>
                </div>

                {/* BARIS BAWAH */}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[11px] text-zinc-500">
                    Rp {t.price_idr.toLocaleString("id-ID")}
                  </p>

                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-semibold border ${
                      t.priceChangePercent >= 0
                        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                        : "text-red-400 border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    {t.priceChangePercent >= 0 ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )}
                    <span>{Math.abs(t.priceChangePercent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Berita Crypto (mini tab + thumbnail + badge) */}
        <div
          className={`rounded-2xl border border-zinc-800 shadow-md ${
            amoled ? "bg-black/40" : "bg-zinc-900/80"
          } p-4 mb-10`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">
                Berita Crypto
              </p>
            </div>

            {/* mini tabs */}
            <div className="flex items-center gap-1.5 text-[10px]">
              {[
                { id: "all", label: "Semua" },
                { id: "bitcoin", label: "BTC" },
                { id: "ethereum", label: "ETH" },
                { id: "defi", label: "DeFi/NFT" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setNewsTab(tab.id)}
                  className={`px-2.5 py-[3px] rounded-full border text-[10px] transition
                    ${
                      newsTab === tab.id
                        ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300"
                        : "bg-zinc-900/70 border-zinc-700 text-zinc-400"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {newsLoading && !newsError && (
            <div className="space-y-2 mt-2">
              <div className="h-3 w-40 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-full bg-zinc-900 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-zinc-900 rounded animate-pulse" />
            </div>
          )}

          {/* Error */}
          {!newsLoading && newsError && (
            <p className="text-[11px] text-amber-400 mt-2">{newsError}</p>
          )}

          {/* No news */}
          {!newsLoading &&
            !newsError &&
            filteredNews.length === 0 &&
            news.length > 0 && (
              <p className="text-[11px] text-zinc-500 mt-2">
                Belum ada berita untuk kategori ini.
              </p>
            )}

          {!newsLoading && !newsError && news.length === 0 && (
            <p className="text-[11px] text-zinc-500 mt-2">
              Belum ada berita untuk ditampilkan.
            </p>
          )}

          {/* List berita */}
          {!newsLoading && !newsError && filteredNews.length > 0 && (
            <div className="mt-2 space-y-3">
              {filteredNews.map((item) => {
                const category = getNewsCategory(item);
                const breaking = isBreaking(item);

                return (
                  <button
                    key={item.url}
                    type="button"
                    className="w-full text-left group"
                    onClick={() => {
                      if (!item.url) return;
                      window.open(item.url, "_blank");
                    }}
                  >
                    <div className="flex gap-3 pb-3 border-b border-zinc-800/60 last:border-b-0 group-active:scale-[0.99] transition-transform">
                      {/* Thumbnail */}
                      {item.urlToImage ? (
                        <div className="w-[68px] h-[68px] flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                          <img
                            src={item.urlToImage}
                            onError={(e) => {
                              // Ganti ke placeholder aman jika gambar (item.imageSrc) gagal dimuat
                              e.currentTarget.src = FRONTEND_PLACEHOLDER;
                              // Mencegah loop tak terbatas
                              e.currentTarget.onerror = null;
                            }}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-[68px] h-[68px] flex-shrink-0 rounded-xl bg-zinc-800/70 border border-zinc-700/80 flex items-center justify-center text-[11px] text-zinc-400">
                          No Img
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] px-2 py-[1px] rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400">
                            {category}
                          </span>
                          {breaking && (
                            <span className="text-[10px] px-2 py-[1px] rounded-full bg-rose-600/15 border border-rose-500/60 text-rose-300">
                              🔥 Breaking
                            </span>
                          )}
                        </div>

                        <p className="text-[13px] font-medium text-zinc-100 group-hover:text-emerald-300 line-clamp-2">
                          {item.title_id || item.title}
                        </p>

                        {(item.description_id || item.description) && (
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {item.description_id || item.description}
                          </p>
                        )}

                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="truncate">
                            {item.source?.name || "NewsAPI"}
                          </span>
                          <div className="flex items-center gap-1">
                            {item.publishedAt && (
                              <span>
                                {new Date(item.publishedAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  }
                                )}
                              </span>
                            )}
                            <span className="opacity-60 group-hover:opacity-100">
                              ↗
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <SystemHealthPopup
          health={health}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
