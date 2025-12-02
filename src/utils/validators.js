// src/utils/validators.js

// EVM address (0x + 40 hex)
export function isValidEvmAddress(addr = "") {
  if (!addr) return false;
  const v = addr.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// TON address (base64url ~48-50 chars) or hex (0x + 64 hex)
export function isValidTonAddress(addr = "") {
  if (!addr) return false;
  const v = addr.trim();
  const tonBase64 = /^[A-Za-z0-9\-_]{48,50}$/;
  const tonHex = /^0x[0-9a-fA-F]{64}$/;
  return tonBase64.test(v) || tonHex.test(v);
}

// Generic isValidAddress that dispatches by network key
export function isValidAddressForNetwork(networkKey = "", addr = "") {
  const k = String(networkKey || "").toLowerCase();
  if (!addr) return false;

  // normalize aliases
  if (
    k === "eth" ||
    k === "ethereum" ||
    k === "arbitrum" ||
    k === "optimism" ||
    k === "polygon" ||
    k === "bsc" ||
    k === "base"
  ) {
    return isValidEvmAddress(addr);
  }
  if (k === "ton") {
    return isValidTonAddress(addr);
  }

  // fallback: just require non-empty string
  return typeof addr === "string" && addr.trim().length > 0;
}
