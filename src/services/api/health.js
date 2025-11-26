import { request } from "../request";

export async function getSystemHealth() {
  const { res, data } = await request("/health");

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message || "Error mendapatkan data system health."
    );
  }

  return data;
}
