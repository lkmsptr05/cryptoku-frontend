// ===============================
// src/pages/Order.jsx
// ===============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import BannerBox from "../components/BannerBox";
import { submitBuyOrder } from "../services/api";
import useNotificationsBadge from "../hooks/useNotificationsBadge";
import { API_BASE_URL } from "../config/api";
import { useAllPrices } from "../hooks/usePrices";
import useTelegramAuth from "../hooks/useTelegramAuth";
import useMyBalance from "../hooks/useMyBalance";

const SERVICE_FEE_PERCENT = 4; // sudah termasuk Midtrans
const MIN_PURCHASE_IDR = 1000; // minimal pembelian tetap (Rp)

// helper format pair
const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC|USD)$/, "/$1") || "-";

// normalisasi network key untuk endpoint gas
const mapNetworkKeyForGas = (key = "") => {
  const k = key.toLowerCase();
  if (k === "eth") return "ethereum"; // backend maunya 'ethereum'
  return key;
};

const formatUsdPrice = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n)) return "0";

  if (Math.abs(n - 1) < 0.000001) {
    return "1";
  }

  const truncated = Math.trunc(n * 1000) / 1000;
  return truncated.toFixed(3);
};

const baseSymbolFromPair = (symbol) =>
  symbol ? symbol.toUpperCase().replace(/(USDT|USDC|BUSD|USD)$/, "") : "";

// helper nama network
const prettyNetworkName = (key) => {
  if (!key) return "-";
  const k = key.toLowerCase();
  if (k === "eth" || k === "ethereum") return "Ethereum";
  if (k === "bsc") return "BNB Chain";
  if (k === "arbitrum") return "Arbitrum";
  if (k === "optimism") return "Optimism";
  if (k === "polygon") return "Polygon";
  if (k === "base") return "Base";
  return key.toUpperCase();
};

// format jumlah token untuk display di input & button
const formatTokenAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
};

// validasi address EVM sederhana
const isValidEvmAddress = (addr) => {
  if (!addr) return false;
  const v = addr.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(v);
};

/* ====================== HOOK: useGasEstimate ====================== */
function useGasEstimate({ networkKey, to, tokenAddress, enabled = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!enabled || !networkKey || !to) return;

    let intervalId;

    const fetchGas = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const params = new URLSearchParams({
          network_key: networkKey,
          to,
        });

        if (tokenAddress) {
          params.append("tokenAddress", tokenAddress);
        }

        const res = await fetch(
          `${API_BASE_URL}/estimate-gas?${params.toString()}`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch gas estimate:", err);
        setErrorMsg(err.message || "Failed to fetch gas estimate");
      } finally {
        setLoading(false);
      }
    };

    // fetch pertama
    fetchGas();
    // polling tiap 10 detik
    intervalId = window.setInterval(fetchGas, 10000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [networkKey, to, tokenAddress, enabled]);

  return { data, loading, errorMsg };
}

const formatUsdFee = (usd) => {
  const n = parseFloat(usd);

  if (!Number.isFinite(n) || n <= 0) {
    return "$0.00";
  }

  if (n < 0.001) {
    return "<$0.001";
  }

  if (n < 0.01) {
    return "<$0.01";
  }

  return `$${n.toFixed(2)}`;
};

/* ====================== MAIN: Order Page ====================== */
export default function Order() {
  const { amoled, toggleTheme } = useTheme();
  const { state } = useLocation();
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsBadge();

  // harga global dari hook (buat pair dropdown & fallback token)
  const { prices: allPrices } = useAllPrices();

  // auth + saldo
  const { user } = useTelegramAuth();
  const { balance: availableBalanceRaw, loading: balanceLoading } =
    useMyBalance(user?.id);
  const availableBalanceNumber = Number(availableBalanceRaw || 0);

  const tokenFromState = state?.token || null;
  const tokenFromPrices = useMemo(
    () => allPrices.find((p) => p.symbol === symbol),
    [allPrices, symbol]
  );

  const token = tokenFromState || tokenFromPrices || null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  // dropdown state (network)
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const networkDropdownRef = useRef(null);

  // dropdown state (pair selector)
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const pairDropdownRef = useRef(null);

  // floating header state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // daftar token yang benar-benar dijual
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [tokensError, setTokensError] = useState(null);

  // pilih network (id dari token di /api/tokens)
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  // input wallet penerima
  const [toAddress, setToAddress] = useState("");
  const [walletError, setWalletError] = useState("");

  // input amount IDR
  const [amountIdr, setAmountIdr] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  // scroll listener — sama seperti Home & Market
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;

      if (currentY < 16) {
        setShowHeader(true);
        lastScrollY.current = currentY;
        return;
      }

      const diff = currentY - lastScrollY.current;

      if (diff > 4 && currentY > 40) {
        setShowHeader(false);
      } else if (diff < -4) {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // click outside network dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target)
      ) {
        setIsNetworkDropdownOpen(false);
      }
    };

    if (isNetworkDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNetworkDropdownOpen]);

  // click outside pair dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pairDropdownRef.current &&
        !pairDropdownRef.current.contains(event.target)
      ) {
        setIsPairDropdownOpen(false);
      }
    };

    if (isPairDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPairDropdownOpen]);

  // fetch daftar token yang dijual (backend)
  useEffect(() => {
    let aborted = false;

    const fetchSupportedTokens = async () => {
      try {
        setTokensLoading(true);
        setTokensError(null);

        const res = await fetch(`${API_BASE_URL}/tokens`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error("API tidak success");

        const activeTokens = (json.data || []).filter((t) => t.is_active);
        if (!aborted) {
          setSupportedTokens(activeTokens);
        }
      } catch (err) {
        console.error("fetchSupportedTokens error:", err);
        if (!aborted) {
          setTokensError("Gagal memuat daftar token yang tersedia.");
        }
      } finally {
        if (!aborted) setTokensLoading(false);
      }
    };

    fetchSupportedTokens();

    return () => {
      aborted = true;
    };
  }, []);

  const positive = token ? token.priceChangePercent >= 0 : true;
  const baseSymbol = token ? baseSymbolFromPair(token.symbol) : null;

  // semua network yang support baseSymbol ini
  const supportedVariants = useMemo(() => {
    if (!baseSymbol) return [];
    return supportedTokens.filter(
      (t) => String(t.symbol).toUpperCase() === baseSymbol
    );
  }, [baseSymbol, supportedTokens]);

  // apakah token ini support di CryptoKu (minimal ada 1 variant network)
  const isSupported = supportedVariants.length > 0;

  // daftar pair yang available utk dropdown (dari harga global)
  const availablePairs = useMemo(
    () => allPrices.filter((p) => p.status === "available"),
    [allPrices]
  );

  // set default selected network saat variants berubah
  useEffect(() => {
    if (supportedVariants.length === 0) {
      setSelectedTokenId(null);
      return;
    }

    setSelectedTokenId((prev) => {
      if (prev && supportedVariants.some((t) => t.id === prev)) return prev;
      return supportedVariants[0].id;
    });
  }, [supportedVariants]);

  const selectedBackendToken =
    supportedVariants.find((t) => t.id === selectedTokenId) || null;

  const isValidWallet = !!toAddress && isValidEvmAddress(toAddress);

  const gasEnabled =
    !!token && isSupported && !!selectedBackendToken && isValidWallet;

  const rawNetworkKey = selectedBackendToken?.network_key || "";

  const {
    data: gasData,
    loading: gasLoading,
    errorMsg: gasError,
  } = useGasEstimate({
    networkKey: mapNetworkKeyForGas(rawNetworkKey),
    to: toAddress,
    tokenAddress:
      selectedBackendToken && selectedBackendToken.contract_address
        ? selectedBackendToken.contract_address
        : undefined,
    enabled: gasEnabled,
  });

  const isNativeToken =
    selectedBackendToken && !selectedBackendToken.contract_address;

  // nilai numeric dari amountIdr (dalam rupiah)
  const amountIdrNumber = amountIdr ? Number(amountIdr) : 0;

  // apakah melebihi saldo
  const exceedsBalance =
    amountIdrNumber > 0 &&
    availableBalanceNumber > 0 &&
    amountIdrNumber > availableBalanceNumber;

  // tampilan "Rp 1.000"
  const formattedAmountIdr = amountIdrNumber
    ? `Rp ${amountIdrNumber.toLocaleString("id-ID")}`
    : "";

  // KONVERSI & PERHITUNGAN: IDR -> USD -> potong fee & gas -> token diterima
  const amountUsd =
    amountIdrNumber && token?.price_idr && token?.price_usd
      ? (amountIdrNumber * Number(token.price_usd)) / Number(token.price_idr)
      : 0;

  const serviceFeeUsd = amountUsd ? (amountUsd * SERVICE_FEE_PERCENT) / 100 : 0;

  const serviceFeeIdr = amountIdrNumber
    ? (amountIdrNumber * SERVICE_FEE_PERCENT) / 100
    : 0;

  const gasFeeUsd = gasData?.totalFeeUSD || 0;
  const gasFeeIdr = gasData?.totalFeeIDR || 0;
  const serviceFeeRate = SERVICE_FEE_PERCENT / 100;

  const usdAfterFee = Math.max(amountUsd - serviceFeeUsd - gasFeeUsd, 0);

  const estimatedToken =
    usdAfterFee && token?.price_usd ? usdAfterFee / Number(token.price_usd) : 0;

  // Minimum dinamis berdasarkan gas fee + service fee
  const dynamicMinIdr =
    gasData && !gasError && gasFeeIdr > MIN_PURCHASE_IDR
      ? Math.ceil(gasFeeIdr / (1 - serviceFeeRate)) + 1
      : MIN_PURCHASE_IDR;

  // Cek apakah amount sudah memenuhi minimum
  const meetsDynamicMin =
    amountIdrNumber > 0 ? amountIdrNumber >= dynamicMinIdr : true;

  const canSubmitBuy =
    gasEnabled &&
    !gasLoading &&
    !gasError &&
    isValidWallet &&
    amountIdrNumber > 0 &&
    estimatedToken > 0 &&
    meetsDynamicMin &&
    !exceedsBalance;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmitBuy) return;

    setSubmitError("");
    setShowPreview(true);
  };

  const handleConfirmBuy = async () => {
    if (!canSubmitBuy || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const tokenSymbol = token
        ? token.symbol
        : selectedBackendToken.price_symbol;
      if (!tokenSymbol) {
        throw new Error("Symbol token tidak ditemukan di konfigurasi.");
      }

      const order = await submitBuyOrder(
        tokenSymbol,
        selectedBackendToken.network_key,
        Number(amountIdr),
        toAddress.trim()
      );

      setLastOrder(order);
      setShowPreview(false);

      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp?.showAlert) {
        tgWebApp.showAlert("Order pembelian sedang diproses ✅");
      }
    } catch (err) {
      console.error("CONFIRM BUY FAILED:", err);
      setSubmitError(err.message || "Gagal mengirim order beli");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLabelToken =
    estimatedToken > 0 ? formatTokenAmount(estimatedToken) : "";

  const handleSetMaxAmount = () => {
    if (!availableBalanceNumber || availableBalanceNumber <= 0) return;
    // floor biar nggak ada pecahan aneh
    setAmountIdr(String(Math.floor(availableBalanceNumber)));
  };

  const bgClass = amoled
    ? "bg-black"
    : "bg-gradient-to-b from-zinc-950 to-black";

  return (
    <div className={`min-h-screen px-4 pt-16 ${bgClass} text-white pb-32`}>
      {/* ===========================
          FLOATING HEADER
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
              title="Order"
              subtitle={
                token
                  ? formatPair(token.symbol)
                  : symbol
                  ? formatPair(symbol)
                  : "Silahkan pilih koin di Market"
              }
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
        {/* Tombol kembali */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-2 inline-flex items-center gap-2 mt-5 text-xs text-zinc-400 hover:text-zinc-100 transition"
        >
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-zinc-700">
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span>Kembali</span>
        </button>

        <BannerBox
          label="Tips"
          title="Waktu terbaik membeli"
          description="Biasanya harga lebih stabil saat volume rendah."
          accent="emerald"
        />

        {/* ====== JIKA TOKEN TIDAK ADA ====== */}
        {!token && (
          <div
            className={`rounded-2xl border p-4 mt-2 text-center ${
              amoled
                ? "bg-black/40 border-zinc-800"
                : "bg-zinc-900/80 border-zinc-800"
            }`}
          >
            <p className="text-sm font-semibold text-white mb-1">
              Token belum dipilih
            </p>
            <p className="text-xs text-zinc-400 mb-3">
              Silakan pilih koin terlebih dahulu dari halaman Market untuk
              membuat order.
            </p>
            <button
              type="button"
              onClick={() => navigate("/market")}
              className="w-full py-2 rounded-xl bg-emerald-500 text-black text-sm font-semibold active:scale-[0.98] transition"
            >
              Pergi ke Market
            </button>
          </div>
        )}

        {/* ====== MODE ADA TOKEN ====== */}
        {token && (
          <>
            {/* INFO COIN + pair dropdown */}
            <div
              className={`rounded-2xl border border-zinc-800 p-4 shadow-md ${
                amoled ? "bg-black/40" : "bg-zinc-900/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div ref={pairDropdownRef} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setIsPairDropdownOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-sm font-semibold hover:text-emerald-300 transition"
                    >
                      <span>{formatPair(token.symbol)}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isPairDropdownOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Dropdown pair list */}
                    {availablePairs.length > 0 && (
                      <div
                        className={`
                          absolute z-30 mt-2 w-44
                          rounded-md border border-zinc-700
                          bg-zinc-950
                          shadow-lg
                          max-h-64 overflow-auto
                          transform origin-top left-0 top-5
                          transition-all duration-150 ease-out
                          ${
                            isPairDropdownOpen
                              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                          }
                        `}
                      >
                        {availablePairs.map((p) => {
                          const active = p.symbol === token.symbol;
                          return (
                            <button
                              key={p.symbol}
                              type="button"
                              onClick={() => {
                                setIsPairDropdownOpen(false);
                                navigate(`/order/${p.symbol}`, {
                                  state: { token: p },
                                });
                              }}
                              className={`
                                w-full text-left px-3 py-2 text-xs
                                flex items-center justify-between
                                ${
                                  active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "text-zinc-200"
                                }
                                hover:bg-zinc-800/70
                              `}
                            >
                              <span>{formatPair(p.symbol)}</span>
                              {active && (
                                <span className="text-[10px] text-emerald-400">
                                  aktif
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400">Last price (USD)</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${formatUsdPrice(token.price_usd)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Rp {token.price_idr.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div
                className={`mt-3 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                  positive
                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                    : "text-red-400 border-red-500/40 bg-red-500/5"
                }`}
              >
                {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>
                  {positive ? "+" : ""}
                  {Math.abs(token.priceChangePercent).toFixed(2)}%
                </span>
              </div>

              {tokensLoading && (
                <p className="text-[11px] text-zinc-500 mt-2">
                  Memeriksa ketersediaan token di CryptoKu...
                </p>
              )}
              {tokensError && (
                <p className="text-[11px] text-red-400 mt-2">
                  {tokensError} Order untuk token ini sementara dinonaktifkan.
                </p>
              )}
            </div>

            {/* Jika token TIDAK tersedia */}
            {!tokensLoading && !tokensError && !isSupported && (
              <div
                className={`rounded-2xl border border-amber-700/70 p-4 shadow-md ${
                  amoled ? "bg-amber-900/20" : "bg-amber-900/25"
                }`}
              >
                <p className="text-sm font-semibold text-amber-200">
                  Token belum tersedia
                </p>
                <p className="text-xs text-amber-200/80 mt-1">
                  {baseSymbol
                    ? `${baseSymbol} belum tersedia untuk order di CryptoKu.`
                    : "Token ini belum tersedia untuk order di CryptoKu."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/market")}
                  className="mt-3 w-full py-2 rounded-xl bg-amber-400 text-black text-sm font-semibold active:scale-[0.98] transition"
                >
                  Pilih koin lain di Market
                </button>
              </div>
            )}

            {/* INPUT ORDER — hanya jika token didukung */}
            {!tokensLoading && !tokensError && isSupported && (
              <>
                <form
                  className={`rounded-2xl border border-zinc-800 p-4 shadow-md space-y-4 ${
                    amoled ? "bg-black/40" : "bg-zinc-900/80"
                  }`}
                  onSubmit={handleSubmit}
                >
                  <p className="text-xs text-zinc-400 uppercase tracking-[0.15em]">
                    Buy Order
                  </p>

                  {/* Dropdown network */}
                  <div>
                    <label className="text-xs text-zinc-400">
                      Network & Token
                    </label>

                    <div ref={networkDropdownRef} className="relative mt-1">
                      <button
                        type="button"
                        onClick={() => setIsNetworkDropdownOpen((v) => !v)}
                        className={`
                          w-full
                          flex items-center justify-between
                          bg-black/40
                          border
                          rounded-xl
                          px-3 py-2.5
                          text-sm
                          outline-none
                          transition
                          focus:border-emerald-500
                          focus:ring-2 focus:ring-emerald-500/20
                          ${
                            isNetworkDropdownOpen
                              ? "border-emerald-500/70 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                              : "border-zinc-700"
                          }
                          ${
                            supportedVariants.length === 0
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                        `}
                        disabled={supportedVariants.length === 0}
                      >
                        <span className="truncate text-left">
                          {selectedBackendToken
                            ? `${prettyNetworkName(
                                selectedBackendToken.network_key
                              )} · ${
                                selectedBackendToken.contract_address
                                  ? baseSymbol
                                  : selectedBackendToken.symbol
                              }`
                            : "Pilih network"}
                        </span>

                        <span className="ml-2 inline-flex items-center">
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isNetworkDropdownOpen ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>

                      {supportedVariants.length > 0 && (
                        <div
                          className={`
                            absolute z-30 mt-1 w-full
                            rounded-xl border border-zinc-700
                            bg-zinc-950
                            shadow-lg
                            max-h-56 overflow-auto
                            transform origin-top
                            transition-all duration-150 ease-out
                            ${
                              isNetworkDropdownOpen
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                            }
                          `}
                        >
                          {supportedVariants.map((v) => {
                            const isActive = v.id === selectedTokenId;
                            const label = `${prettyNetworkName(
                              v.network_key
                            )} · ${v.contract_address ? baseSymbol : v.symbol}`;

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTokenId(v.id);
                                  setIsNetworkDropdownOpen(false);
                                }}
                                className={`
                                  w-full text-left px-3 py-2 text-sm
                                  flex items-center justify-between
                                  ${
                                    isActive
                                      ? "bg-emerald-500/10"
                                      : "bg-transparent"
                                  }
                                  hover:bg-zinc-800/60
                                `}
                              >
                                <span className="truncate">{label}</span>
                                {isActive && (
                                  <span className="text-[10px] text-emerald-400 ml-2">
                                    aktif
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {selectedBackendToken && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {isNativeToken
                          ? "Transaksi akan menggunakan native coin jaringan tersebut."
                          : `Transaksi akan menggunakan token ${baseSymbol} di jaringan ${prettyNetworkName(
                              selectedBackendToken.network_key
                            )}.`}
                      </p>
                    )}
                  </div>

                  {/* Wallet penerima */}
                  <div>
                    <label className="text-xs text-zinc-400">
                      Wallet penerima
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={toAddress}
                      onChange={(e) => {
                        const value = e.target.value;
                        setToAddress(value.trim());

                        if (!value.trim()) {
                          setWalletError("");
                          return;
                        }

                        if (!isValidEvmAddress(value)) {
                          setWalletError(
                            "Address tidak valid. Gunakan address EVM 0x dengan 42 karakter."
                          );
                        } else {
                          setWalletError("");
                        }
                      }}
                      className={`w-full mt-1 bg-black/40 border rounded-xl px-3 py-2 text-sm outline-none ${
                        walletError
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-700 focus:border-emerald-500"
                      }`}
                    />

                    {!toAddress && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Masukkan address wallet tujuan di jaringan yang sama.
                      </p>
                    )}

                    {toAddress && walletError && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {walletError}
                      </p>
                    )}

                    {toAddress && !walletError && (
                      <p className="text-[11px] text-emerald-400 mt-1">
                        Address valid untuk jaringan EVM.
                      </p>
                    )}
                  </div>

                  {/* Amount IDR + MAX */}
                  <div>
                    <label className="text-xs text-zinc-400">
                      Amount (IDR)
                    </label>

                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Rp 100.000"
                        value={formattedAmountIdr}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setAmountIdr(raw);
                        }}
                        className="flex-1 bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleSetMaxAmount}
                        className="px-3 py-2 rounded-xl border border-zinc-700 text-[11px] font-semibold text-zinc-200 hover:border-emerald-500 hover:text-emerald-300 active:scale-[0.97] transition"
                      >
                        MAX
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-500 mt-1">
                      Saldo tersedia:{" "}
                      <span className="font-medium text-zinc-200">
                        {balanceLoading
                          ? "Memuat..."
                          : `Rp ${availableBalanceNumber.toLocaleString(
                              "id-ID"
                            )}`}
                      </span>
                    </p>

                    <p className="text-[11px] text-zinc-500 mt-1">
                      Minimum pembelian untuk jaringan ini:{" "}
                      <span className="font-medium">
                        Rp {dynamicMinIdr.toLocaleString("id-ID")}
                      </span>
                    </p>

                    {exceedsBalance && (
                      <p className="text-[11px] text-red-400 mt-1">
                        Nominal melebihi saldo tersedia. Kurangi jumlah atau
                        lakukan top up terlebih dahulu.
                      </p>
                    )}

                    {Number(amountIdr) > 0 && !meetsDynamicMin && (
                      <p className="text-[11px] text-amber-400 mt-1">
                        Nominal masih di bawah minimum. Minimal harus lebih
                        tinggi dari estimasi gas fee dan biaya layanan.
                      </p>
                    )}
                  </div>

                  {/* Total token diterima */}
                  <div>
                    <label className="text-xs text-zinc-400">
                      Total diterima ({formatPair(token.symbol)})
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formatTokenAmount(estimatedToken)}
                      placeholder="Auto calculate"
                      className="w-full mt-1 bg-black/20 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300"
                    />
                  </div>

                  {/* Estimasi Gas + Service Fee */}
                  <div className="border-t border-zinc-800 pt-4 mt-2 space-y-2 text-sm">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider">
                      Estimasi Gas Fee
                    </p>
                    {!toAddress && (
                      <p className="text-zinc-500 text-xs">
                        Masukkan wallet penerima untuk melihat estimasi gas.
                      </p>
                    )}
                    {gasEnabled && !gasData && gasLoading && (
                      <p className="text-zinc-500 text-xs">
                        Menghitung estimasi gas…
                      </p>
                    )}
                    {gasEnabled && gasError && (
                      <p className="text-red-400 text-xs">
                        Gagal mengambil estimasi gas: {gasError}
                      </p>
                    )}

                    {gasEnabled && gasData && !gasError && (
                      <div
                        className={`space-y-2 ${
                          gasLoading ? "animate-pulse" : ""
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Jaringan</span>
                          <span className="font-medium">
                            {selectedBackendToken
                              ? prettyNetworkName(
                                  selectedBackendToken.network_key
                                )
                              : "-"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-zinc-400">Perkiraan</span>
                          <span className="font-medium">
                            Rp{" "}
                            {Number(gasData.totalFeeIDR).toLocaleString(
                              "id-ID",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            ~({formatUsdFee(gasData.totalFeeUSD)})
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-zinc-400">Biaya layanan</span>
                          <span className="font-medium">
                            {SERVICE_FEE_PERCENT}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-[11px] text-red-400 mt-2">
                      {submitError}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!canSubmitBuy}
                      className={`w-full py-2.5 rounded-xl font-semibold active:scale-[0.99] transition-transform ${
                        canSubmitBuy
                          ? "bg-emerald-500 text-black"
                          : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      {buttonLabelToken
                        ? `BELI ${buttonLabelToken} ${baseSymbol}`
                        : `BELI ${formatPair(token.symbol)}`}
                    </button>
                  </div>
                </form>

                <div className="text-xs text-zinc-500 text-center pt-2">
                  Token ini terdaftar di CryptoKu. Estimasi sudah termasuk gas
                  fee & biaya layanan (Midtrans).
                </div>
              </>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowPreview(false)}
                />

                <div
                  className={`
                    relative z-10 w-full max-w-sm
                    rounded-2xl border border-zinc-800
                    shadow-xl
                    ${amoled ? "bg-black" : "bg-zinc-900"}
                    p-4 space-y-3
                  `}
                >
                  <h3 className="text-sm font-semibold text-white">
                    Konfirmasi Pembelian
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Periksa kembali detail transaksi sebelum melanjutkan.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Token</span>
                      <span className="font-medium">
                        {formatPair(token.symbol)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Network</span>
                      <span className="font-medium">
                        {selectedBackendToken
                          ? prettyNetworkName(selectedBackendToken.network_key)
                          : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Wallet penerima</span>
                      <span className="font-medium truncate max-w-[55%] text-right">
                        {toAddress}
                      </span>
                    </div>

                    <div className="h-px bg-zinc-800 my-1" />

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nominal (IDR)</span>
                      <span className="font-medium">
                        Rp {amountIdrNumber.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Setara (USD)</span>
                      <span className="font-medium">
                        ${amountUsd.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">
                        Biaya layanan ({SERVICE_FEE_PERCENT}%)
                      </span>
                      <span className="font-medium">
                        Rp{" "}
                        {Number(serviceFeeIdr).toLocaleString("id-ID", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    {gasData && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Estimasi gas</span>
                        <span className="font-medium">
                          Rp{" "}
                          {Number(gasData.totalFeeIDR || 0).toLocaleString(
                            "id-ID",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}{" "}
                          · {formatUsdFee(gasData.totalFeeUSD)}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-zinc-800 my-1" />

                    <div className="flex justify-between items-baseline">
                      <span className="text-zinc-400">Total diterima</span>
                      <span className="font-semibold text-emerald-400">
                        {formatTokenAmount(estimatedToken)} {baseSymbol}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="w-1/2 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-200 active:scale-[0.98] transition"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBuy}
                      disabled={!canSubmitBuy}
                      className={`w-1/2 py-2 rounded-xl text-xs font-semibold active:scale-[0.98] transition ${
                        canSubmitBuy
                          ? "bg-emerald-500 text-black"
                          : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      Konfirmasi Beli
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!tokensLoading && tokensError && (
              <div className="text-xs text-zinc-500 text-center pt-2">
                Tidak dapat memverifikasi ketersediaan token. Coba lagi beberapa
                saat.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
