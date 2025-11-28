// src/components/SplashScreen.jsx
import React from "react";

export function SplashScreen({ isFadingOut = false }) {
  return (
    <div
      className={
        "fixed inset-0 flex flex-col items-center justify-center bg-black text-center transition-opacity duration-500 " +
        (isFadingOut ? "opacity-0" : "opacity-100")
      }
    >
      <img
        src="/assets/logo/cryptoku.png"
        alt="CryptoKu"
        className="w-56 h-56 mb-6 animate-pulse"
      />

      <h1 className="text-xl font-semibold text-white">
        Crypto<span className="text-emerald-400">Ku</span>
      </h1>

      <p className="text-sm text-gray-400 mt-1">Tunggu sebentar ya... 🚀</p>

      <div className="mt-5 flex gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
