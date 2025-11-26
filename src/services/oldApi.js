// src/services/api.js
// Semua call API lewat helper request/authedGet/authedPost

import { request, authedGet, authedPost } from "./request";

/* -------------------------------------------------------------------------- */
/*                                Helper Utils                                */
/* -------------------------------------------------------------------------- */

// pair formatter
const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1");

/* -------------------------------------------------------------------------- */
/*                                  PRICES                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /prices
 */
export async function getAllPrices() {
  const { res, data } = await request("/prices");

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Gagal mengambil semua harga.");
  }

  return data.data;
}

/**
 * GET /prices/:symbol
 */
export async function getPrice(symbol) {
  const { res, data } = await request(`/prices/${symbol}`);

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || `Gagal mengambil harga untuk ${symbol}.`
    );
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                                 NETWORKS                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /networks
 */
export async function getNetworks() {
  const { res, data } = await request("/networks");

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || "Gagal mengambil jaringan yang tersedia."
    );
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                                  TOKENS                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /tokens?network=xxx
 */
export async function getTokensByNetwork(networkKey) {
  const { res, data } = await request(`/tokens?network=${networkKey}`);

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message ||
        `Gagal mengambil token untuk jaringan ${networkKey}.`
    );
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                                  HEALTH                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /health
 */
export async function getSystemHealth() {
  const { res, data } = await request("/health");

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || "Error mendapatkan data system health."
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*                               ESTIMATE GAS                                 */
/* -------------------------------------------------------------------------- */

/**
 * GET /estimate-gas
 */
export async function getGas(network_key, to, tokenAddress = null, amount) {
  const qs = new URLSearchParams({
    network_key,
    to,
    from: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  });

  if (tokenAddress) qs.set("tokenAddress", tokenAddress);
  if (amount != null) qs.set("amount", String(amount));

  const { res, data } = await request(`/estimate-gas?${qs.toString()}`);

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Error mendapatkan data gas fee.");
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*                                SPARKLINE                                   */
/* -------------------------------------------------------------------------- */

/**
 * GET /prices/:symbol/sparkline
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
 * GET /me/balance
 * Butuh Telegram initData → pakai authedGet (requireInitData: true)
 */
export async function getMyBalance() {
  const { res, data } = await authedGet("/me/balance");

  if (!res.ok || data.success === false) {
    console.error("API getMyBalance error response:", data);
    throw new Error(
      data.message || data.error?.message || "Gagal mengambil saldo pengguna."
    );
  }

  return Number(data.data?.balance_available ?? 0);
}

/**
 * GET /me
 * Butuh Telegram initData → pakai authedGet
 * Response ideal: { data: { user, balance, wallets } }
 */
export async function getMe() {
  const { res, data } = await authedGet("/me");

  if (!res.ok || data.success === false) {
    console.error("API getMe error response:", data);
    throw new Error(
      data.message || data.error?.message || "Gagal mengambil data user."
    );
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                                TOPUP QRIS                                  */
/* -------------------------------------------------------------------------- */

export async function createTopupQR(amount) {
  const { res, data } = await authedPost("/topup/qris", { amount });

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || "Gagal bikin QR");
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*                                NOTIFICATIONS                               */
/* -------------------------------------------------------------------------- */

export async function getNotifications() {
  const { res, data } = await authedGet("/notifications");

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil notifikasi");
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                                CRYPTO NEWS                                 */
/* -------------------------------------------------------------------------- */

export async function getCryptoNews() {
  const { res, data } = await request("/news/crypto");

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil berita");
  }

  return data.articles;
}

/* -------------------------------------------------------------------------- */
/*                              BUY ORDER (SPOT)                              */
/* -------------------------------------------------------------------------- */

/**
 * POST /orders/buy
 */
export async function submitBuyOrder(
  tokenSymbol,
  networkKey,
  amountIdr,
  toAddress
) {
  const payload = {
    token_symbol: tokenSymbol,
    token_pair: formatPair(tokenSymbol),
    amount_idr: amountIdr,
    network_key: networkKey,
    to_address: toAddress,
  };

  const { res, data } = await authedPost("/orders/buy", payload);

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengirim order beli");
  }

  return data.data;
}
