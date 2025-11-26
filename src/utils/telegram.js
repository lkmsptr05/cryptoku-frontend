// src/utils/telegram.js

/**
 * Ambil initData langsung dari Telegram WebApp
 */
export function getInitData() {
  if (typeof window === "undefined") return null;

  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  return tg.initData || null;
}

/**
 * Ambil parsed initData (object, bukan string)
 */
export function getParsedInitData() {
  if (typeof window === "undefined") return null;

  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  return tg.initDataUnsafe || null;
}

/**
 * Ambil user dari Telegram WebApp
 */
export function getTelegramUser() {
  const data = getParsedInitData();
  return data?.user || null;
}

/**
 * Cek apakah berjalan di Telegram WebApp
 */
export function isTelegramWebApp() {
  return Boolean(window?.Telegram?.WebApp);
}

/**
 * Optional: trigger haptic feedback
 */
export function haptic(type = "light") {
  if (window?.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
  }
}
