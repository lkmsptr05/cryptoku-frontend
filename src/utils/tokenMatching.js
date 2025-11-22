// src/utils/tokenMatching.js

/**
 * MarketCoin contoh:
 * {
 *   symbol: "USDC",
 *   networkKey: "ethereum",
 *   contractAddress: "0x...." || null
 * }
 *
 * SupportedToken dari backend:
 * {
 *   id,
 *   network_key,
 *   symbol,
 *   contract_address,
 *   decimals,
 *   is_active,
 *   ...
 * }
 */

export function findSupportedToken(marketCoin, supportedTokens) {
  if (!marketCoin) return null;

  const candidates = supportedTokens.filter(
    (t) =>
      String(t.symbol).toUpperCase() ===
        String(marketCoin.symbol).toUpperCase() &&
      t.network_key === marketCoin.networkKey
  );

  if (candidates.length === 0) return null;

  const contract =
    marketCoin.contractAddress && marketCoin.contractAddress.toLowerCase
      ? marketCoin.contractAddress.toLowerCase()
      : null;

  if (contract) {
    const byContract = candidates.find(
      (t) => t.contract_address && t.contract_address.toLowerCase() === contract
    );
    if (byContract) return byContract;
  }

  // fallback: native coin / pertama
  return candidates[0];
}

export function isSupportedCoin(marketCoin, supportedTokens) {
  return !!findSupportedToken(marketCoin, supportedTokens);
}
