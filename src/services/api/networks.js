import { request } from "../request";

export async function getNetworks() {
  const { res, data } = await request("/networks");

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || "Gagal mengambil jaringan yang tersedia."
    );
  }

  return data.data;
}
