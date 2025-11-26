import { authedPost } from "../request";

const formatPair = (symbol) =>
  symbol?.toUpperCase().replace(/(USDT|USDC)$/, "/$1");

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
