import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";

export default function Profile() {
    const { amoled, theme, toggleTheme } = useTheme();
  
  return (
    <div className={`min-h-screen px-6 py-6 ${amoled ? "bg-black" : "bg-gradient-to-b from-zinc-900 to-black"} text-white pb-28`}>
      <GlobalHeader
        title="Orders"
        subtitle="Beranda"     
        onToggleTheme={toggleTheme}
        theme={amoled ? "amoled" : "dark"}
      />
      <main>
        <div className="text-zinc-400">Profil pengguna — placeholder.</div>
      </main>
    </div>
  );
}
