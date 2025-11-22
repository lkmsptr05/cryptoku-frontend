// src/contexts/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // theme: "dark" | "light"
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // amoled: boolean (khusus untuk UI gradient/hitam total)
  const [amoled, setAmoled] = useState(
    localStorage.getItem("amoled") === "true"
  );

  // toggle theme from header
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);

    // IMPORTANT:
    // Sync AMOLED with theme automatically (agar Market ikut berubah)
    if (next === "light") {
      setAmoled(false);
      localStorage.setItem("amoled", "false");
    } else {
      setAmoled(true);
      localStorage.setItem("amoled", "true");
    }
  };

  // apply real document class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, amoled, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
