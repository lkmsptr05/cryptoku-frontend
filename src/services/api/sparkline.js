import { request } from "../request";

export async function getSparkline(symbol) {
  const { res, data } = await request(`/prices/${symbol}/sparkline`);

  if (!res.ok) {
    throw new Error(`Sparkline HTTP ${res.status}`);
  }

  return data.data || data;
}
