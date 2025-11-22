import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import GlobalHeader from "../components/GlobalHeader";
import BannerBox from "../components/BannerBox";

export default function Profile() {
  const { amoled, theme, toggleTheme } = useTheme();
  // Floating header state (match Home)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  return (
    <div
      className={`min-h-screen px-4 pt-16 ${
        amoled ? "bg-black" : "bg-gradient-to-b from-zinc-900 to-black"
      } text-white pb-28`}
    >
      {/* ===========================
                FLOATING HEADER
            ============================ */}
      <div className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full mx-auto pointer-events-auto">
          <div
            className={`rounded-b-lg px-5 border backdrop-blur-md shadow-md
                    ${
                      amoled
                        ? "bg-black/85 border-zinc-900"
                        : "bg-zinc-900/85 border-zinc-800"
                    }
                  `}
            style={{
              transform: showHeader ? "translateY(0)" : "translateY(-100%)",
              opacity: showHeader ? 1 : 0,
              transition: "transform 0.35s ease, opacity 0.5s ease",
            }}
          >
            <GlobalHeader
              title="Profile"
              subtitle={"Profile menu"}
              onToggleTheme={toggleTheme}
              theme={amoled ? "amoled" : "dark"}
            />
          </div>
        </div>
      </div>
      <main>
        <BannerBox
          label="Profile pengguna"
          title="Hallo user"
          description="Edit atau lihat informasi pengguna disini"
          accent="red"
        />
      </main>
    </div>
  );
}
