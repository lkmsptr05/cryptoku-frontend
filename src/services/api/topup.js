import { authedPost } from "../request";

export async function createTopupQR(amount) {
  const { res, data } = await authedPost("/topup/qris", { amount });

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || "Gagal bikin QR");
  }

  return data;
}
