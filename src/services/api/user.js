import { authedGet } from "../request";

export async function getMyBalance() {
  const { res, data } = await authedGet("/me/balance");
  console.log(data);
  if (!res.ok || data.success === false) {
    throw new Error(
      data.message || data.error?.message || "Gagal mengambil saldo pengguna."
    );
  }

  return Number(data.data?.balance_available ?? 0);
}

export async function getMe() {
  const { res, data } = await authedGet("/me");
  console.log(data);
  if (!res.ok || data.success === false) {
    throw new Error(
      data.message || data.error?.message || "Gagal mengambil data user."
    );
  }

  return data.data;
}
