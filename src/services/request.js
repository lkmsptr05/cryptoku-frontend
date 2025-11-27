// src/services/request.js
import { API_BASE_URL } from "../config/api";
import { getInitData } from "../utils/telegram";

export async function request(
  path,
  options = {},
  { requireInitData = false } = {}
) {
  if (!path) {
    throw new Error("Path API wajib diisi");
  }

  const finalOptions = {
    method: "GET",
    ...options,
  };

  // Pastikan headers object selalu ada
  finalOptions.headers = {
    ...(finalOptions.headers || {}),
  };

  // Inject initData kalau diminta (untuk endpoint Telegram Auth)
  if (requireInitData) {
    const initData = getInitData();

    if (!initData) {
      throw new Error(
        "initData Telegram tidak tersedia. Buka lewat Telegram WebApp."
      );
    }

    finalOptions.headers["x-telegram-init-data"] = initData;
  }

  // Pastikan tidak terjadi double slash // atau double base url
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  // Untuk debugging, tampilkan info request di console
  // console.log("API FETCH:", finalOptions.method, url);

  const res = await fetch(url, finalOptions);

  const raw = await res.text();
  let data;

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Response bukan JSON valid. Raw:", raw.slice(0, 200));
    throw new Error(
      `Server mengembalikan respon non-JSON (status ${res.status})`
    );
  }

  return { res, data };
}

// ==================
// HELPER FUNCTIONS
// ==================

export function authedGet(path) {
  return request(path, {}, { requireInitData: true });
}

export function authedPost(path, body) {
  return request(
    path,
    {
      method: "POST",
      body: JSON.stringify(body || {}),
      headers: { "Content-Type": "application/json" },
    },
    { requireInitData: true }
  );
}

export function authedPatch(path, body) {
  return request(
    path,
    {
      method: "PATCH",
      body: JSON.stringify(body || {}),
      headers: { "Content-Type": "application/json" },
    },
    { requireInitData: true }
  );
}

export function authedDelete(path) {
  return request(
    path,
    {
      method: "DELETE",
    },
    { requireInitData: true }
  );
}
