// src/utils/helpers.js

/**
 * Helpers used across UI
 */

export function mapNetworkKeyForGas(key = "") {
  if (!key) return "";
  const k = String(key).toLowerCase().trim();

  if (k === "eth" || k === "ethereum") return "ethereum";
  if (k === "bsc" || k === "binance" || k === "bnb") return "bsc";
  if (k === "polygon" || k === "matic") return "polygon";
  if (k === "optimism" || k === "op") return "optimism";
  if (k === "arbitrum" || k === "arb") return "arbitrum";
  if (k === "base") return "base";
  if (k === "ton") return "ton";
  if (k === "solana" || k === "sol") return "solana";

  return k;
}

export function prettyNetworkName(key = "") {
  if (!key) return "-";
  const k = String(key).toLowerCase().trim();

  if (k === "eth" || k === "ethereum") return "Ethereum";
  if (k === "bsc" || k === "binance" || k === "bnb") return "BNB Chain";
  if (k === "polygon" || k === "matic") return "Polygon";
  if (k === "optimism" || k === "op") return "Optimism";
  if (k === "arbitrum" || k === "arb") return "Arbitrum";
  if (k === "base") return "Base";
  if (k === "ton") return "TON";
  if (k === "solana" || k === "sol") return "Solana";

  return key.charAt(0).toUpperCase() + key.slice(1);
}
