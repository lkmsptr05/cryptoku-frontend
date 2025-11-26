// src/services/api/news.js
import { request } from "../request";

export async function getCryptoNews() {
  const { res, data } = await request("/news/crypto");

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil berita");
  }

  return data.articles;
}
