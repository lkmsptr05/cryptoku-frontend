// src/services/api.js

// Bisa nanti diganti ke env: import.meta.env.VITE_API_BASE_URL
// Kalau tidak ada, fallback ke "/api" (reverse proxy dari frontend)
const API_BASE_URL = "https://cryptoku-backend-beige.vercel.app/api";
// const API_BASE_URL = "/api";

/* -------------------------------------------------------------------------- */
/*                                Helper Utils                                */
/* -------------------------------------------------------------------------- */

// Ambil initData langsung dari Telegram WebApp (frontend)
function getInitData() {
  const tgWebApp = window.Telegram?.WebApp;
  return tgWebApp?.initData || "";
}

/**
 * Wrapper fetch + JSON parsing + optional Telegram initData injection
 *
 * @param {string} path - path relatif terhadap API_BASE_URL, contoh: "/prices"
 * @param {RequestInit} options - opsi fetch biasa
 * @param {object} flags
 * @param {boolean} flags.requireInitData - kalau true, inject header x-telegram-init-data
 */
async function request(path, options = {}, { requireInitData = false } = {}) {
  const finalOptions = {
    // default: GET
    method: "GET",
    ...options,
  };

  // Pastikan headers object selalu ada
  finalOptions.headers = {
    ...(finalOptions.headers || {}),
  };

  // Inject initData kalau diminta (untuk endpoint yang lewat telegramAuth)
  if (requireInitData) {
    const initData = getInitData();
    if (!initData) {
      throw new Error(
        "initData Telegram tidak tersedia. Buka lewat Telegram WebApp."
      );
    }
    finalOptions.headers["x-telegram-init-data"] = initData;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, finalOptions);

  // Baca text dulu, baru coba parse JSON biar kalau backend lempar HTML / plain text kita bisa log
  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Response bukan JSON valid. Raw:", raw.slice(0, 200));
    throw new Error(
      `Server mengembalikan respon non-JSON (status ${res.status})`
    );
  }

  return { res, data };
}

// pair formater
const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1");

/* -------------------------------------------------------------------------- */
/*                                  PRICES                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/prices
 */
export async function getAllPrices() {
  try {
    const { res, data } = await request("/prices");

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Gagal mengambil semua harga.");
    }

    return data.data;
  } catch (error) {
    console.error("API Error (getAllPrices):", error);
    throw error;
  }
}

/**
 * GET /api/prices/:symbol
 */
export async function getPrice(symbol) {
  try {
    const { res, data } = await request(`/prices/${symbol}`);

    if (!res.ok || data.error) {
      throw new Error(
        data.error?.message || `Gagal mengambil harga untuk ${symbol}.`
      );
    }

    return data.data;
  } catch (error) {
    console.error("API Error (getPrice):", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                 NETWORKS                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/networks
 */
export async function getNetworks() {
  try {
    const { res, data } = await request("/networks");

    if (!res.ok || data.error) {
      throw new Error(
        data.error?.message || "Gagal mengambil jaringan yang tersedia."
      );
    }

    return data.data;
  } catch (error) {
    console.error("API Error (getNetworks):", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  TOKENS                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/tokens?network=xxx
 */
export async function getTokensByNetwork(networkKey) {
  try {
    const { res, data } = await request(`/tokens?network=${networkKey}`);

    if (!res.ok || data.error) {
      throw new Error(
        data.error?.message ||
          `Gagal mengambil token untuk jaringan ${networkKey}.`
      );
    }

    return data.data;
  } catch (error) {
    console.error("API Error (getTokensByNetwork):", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  HEALTH                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/health
 */
export async function getSystemHealth() {
  try {
    const { res, data } = await request("/health");

    if (!res.ok || data.error) {
      throw new Error(
        data.error?.message || "Error mendapatkan data system health."
      );
    }

    return data;
  } catch (error) {
    console.error("API Error (getSystemHealth):", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                               ESTIMATE GAS                                 */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/estimate-gas
 */
export async function getGas(network_key, to, tokenAddress = null, amount) {
  try {
    const qs = new URLSearchParams({
      network_key,
      to,
      from: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", // TODO: ganti ke address yang bener nanti
    });

    if (tokenAddress) qs.set("tokenAddress", tokenAddress);
    if (amount != null) qs.set("amount", String(amount));

    const { res, data } = await request(`/estimate-gas?${qs.toString()}`);

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Error mendapatkan data gas fee.");
    }

    return data;
  } catch (error) {
    console.error("API Error (getGas):", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                SPARKLINE                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/prices/:symbol/sparkline
 */
export async function getSparkline(symbol) {
  const { res, data } = await request(`/prices/${symbol}/sparkline`);

  if (!res.ok) {
    throw new Error(`Sparkline HTTP ${res.status}`);
  }

  return data.data || data;
}

/* -------------------------------------------------------------------------- */
/*                              USER & BALANCE                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/me/balance
 * Butuh Telegram initData → pakai requireInitData: true
 */
export async function getMyBalance() {
  try {
    const { res, data } = await request(
      "/me/balance",
      { method: "GET" },
      { requireInitData: true }
    );

    if (!res.ok || data.success === false) {
      console.error("API getMyBalance error response:", data);
      throw new Error(
        data.message || data.error?.message || "Gagal mengambil saldo pengguna."
      );
    }

    // Sesuaikan dengan response backend kamu: { data: { balance_available: ... } }
    return Number(data.data?.balance_available ?? 0);
  } catch (error) {
    console.error("API Error (getMyBalance):", error);
    throw error;
  }
}

/**
 * GET /api/me
 * Butuh Telegram initData → pakai requireInitData: true
 * Di-backend bisa kamu isi: { data: { user, balance, wallets } }
 */
export async function getMe() {
  try {
    const { res, data } = await request(
      "/me",
      { method: "GET" },
      { requireInitData: true }
    );

    if (!res.ok || data.success === false) {
      console.error("API getMe error response:", data);
      throw new Error(
        data.message || data.error?.message || "Gagal mengambil data user."
      );
    }

    return data.data; // { user, balance, wallets } sesuai desain kamu
  } catch (error) {
    console.error("API Error (getMe):", error);
    throw error;
  }
}

export async function createTopupQR(amount) {
  const { res, data } = await request(
    "/topup/qris",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    },
    { requireInitData: true }
  );

  if (!res.ok) throw new Error(data.error || "Gagal bikin QR");

  return data;
}

export async function getNotifications() {
  const { res, data } = await request(
    "/notifications",
    { method: "GET" },
    { requireInitData: true }
  );

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil notifikasi");
  }

  return data.data;
}

export async function getCryptoNews() {
  const { res, data } = await request("/news/crypto", { method: "GET" });
  console.log(data);
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil berita");
  }
  return data.articles;
}

// submit order to buy crypto
export async function submitBuyOrder(
  tokenSymbol,
  networkKey,
  amountIdr,
  toAddress
) {
  const { res, data } = await request(
    "/orders/buy",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token_symbol: tokenSymbol,
        token_pair: formatPair(tokenSymbol),
        amount_idr: amountIdr,
        network_key: networkKey,
        to_address: toAddress,
      }),
    },
    { requireInitData: true }
  );
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengirim order beli");
  }
  return data.data;
}
