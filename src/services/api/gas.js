import { request } from "../request";

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
