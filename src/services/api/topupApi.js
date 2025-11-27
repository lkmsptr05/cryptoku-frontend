// src/services/topupApi.js
import { authedPost, authedGet } from "../request";

// Top up via Midtrans Snap
export async function createSnapTopup(amount) {
  const { res, data } = await authedPost("/topup/snap", {
    amount,
  });

  if (!res.ok) {
    throw new Error(data?.error || "Gagal membuat Snap transaction");
  }

  return data;
  // { order_id, amount, snap_token, redirect_url }
}

// Ambil saldo user
export async function fetchBalance() {
  const { res, data } = await authedGet("/topup/balance");

  if (!res.ok) {
    throw new Error(data?.error || "Gagal mengambil saldo");
  }

  return data;
  // { balance }
}

// History top up (optional, kalau mau dipakai di UI)
export async function fetchTopupHistory() {
  const { res, data } = await authedGet("/topup/history");

  if (!res.ok) {
    throw new Error(data?.error || "Gagal mengambil history");
  }

  return data;
  // { history: [...] }
}
