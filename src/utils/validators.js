// src/utils/validators.js

/**
 * Minimal validators used by Order.jsx
 *
 * isValidAddressForNetwork(networkKey, address)
 *  - For EVM networks: validate 0x-prefixed 40-hex (0x + 40 hex chars)
 *  - For TON: accept common base64url-ish TON addrs (UQ.., EQ..) or 0x + 64 hex (raw hex representation)
 *
 * This is a pragmatic validator for UX only. Server-side must revalidate strictly.
 */

export function isValidEvmAddress(addr = "") {
  if (!addr || typeof addr !== "string") return false;
  const v = addr.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// TON address rough checks:
// - base64url-ish (chars A-Z a-z 0-9 - _), length ~48 (approx) for modern TON addresses
// - or hex representation 0x + 64 hex chars (public key / raw)
export function isValidTonAddress(addr = "") {
  if (!addr || typeof addr !== "string") return false;
  const v = addr.trim();

  // base64url-ish / url-safe base64 (length vary 48-50 typical)
  const tonBase64 = /^[A-Za-z0-9\-_]{48,52}$/;
  const tonHex = /^0x[0-9a-fA-F]{64}$/;

  return tonBase64.test(v) || tonHex.test(v);
}

/**
 * Generic dispatcher — normalize networkKey then validate accordingly.
 *
 * networkKey may be 'ethereum', 'eth', 'bsc', 'ton', etc.
 */
export function isValidAddressForNetwork(networkKey = "", address = "") {
  if (!networkKey) return false;
  const k = String(networkKey).toLowerCase().trim();

  // TON networks
  if (k === "ton") return isValidTonAddress(address);

  // If it's any EVM-like chain
  const evmKeys = new Set([
    "eth",
    "ethereum",
    "bsc",
    "binance",
    "bnb",
    "polygon",
    "matic",
    "arbitrum",
    "optimism",
    "base",
  ]);
  if (evmKeys.has(k)) return isValidEvmAddress(address);

  // fallback: try EVM pattern first, then TON
  if (isValidEvmAddress(address)) return true;
  if (isValidTonAddress(address)) return true;

  return false;
}
