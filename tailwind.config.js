// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Poppins akan menjadi font default (sans)
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        
        // (Opsional) Tetap gunakan font monospace untuk harga
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular'], 
      },
    },
  },
  plugins: [],
}