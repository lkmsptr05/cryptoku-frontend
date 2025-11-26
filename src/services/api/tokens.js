import { request } from "../request";

export async function getTokensByNetwork(networkKey) {
  const { res, data } = await request(`/tokens?network=${networkKey}`);

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message ||
        `Gagal mengambil token untuk jaringan ${networkKey}.`
    );
  }

  return data.data;
}
