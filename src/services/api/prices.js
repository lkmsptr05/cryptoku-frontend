import { request } from "../request";

export async function getAllPrices() {
  const { res, data } = await request("/prices");
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Gagal mengambil semua harga.");
  }

  return data.data;
}

export async function getPrice(symbol) {
  const { res, data } = await request(`/prices/${symbol}`);

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || `Gagal mengambil harga untuk ${symbol}.`
    );
  }

  return data.data;
}
