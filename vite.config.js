import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,

    // ✅ IZINKAN NGROK
    allowedHosts: [
      "192.168.100.131",
      ".ngrok-free.app", // domain ngrok baru
      ".ngrok.app", // jaga-jaga
      ".ngrok-free.dev",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
