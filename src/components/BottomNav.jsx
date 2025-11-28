// ===============================
// src/components/BottomNav.jsx
// ===============================
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, User, History, BarChart3 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// ✅ NEW
import { usePendingTopup } from "../contexts/PendingTopupContext.jsx";

export default function BottomNav() {
  const { amoled } = useTheme();

  // ✅ Ambil pendingCount dari context
  const { pendingCount } = usePendingTopup();

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-40
        flex justify-center
        pointer-events-none
      "
    >
      <div
        className="
          w-full max-w-md mx-auto
          px-4
          pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]
          pt-2
          pointer-events-auto
        "
      >
        <div
          className={`
            w-full
            rounded-2xl
            border
            flex items-center justify-between
            px-4 py-2
            backdrop-blur-md
            shadow-lg
            ${
              amoled
                ? "bg-black/80 border-zinc-900"
                : "bg-zinc-900/85 border-zinc-800"
            }
          `}
        >
          <TabItem to="/" label="Home" amoled={amoled}>
            <Home size={20} />
          </TabItem>

          <TabItem to="/market" label="Market" amoled={amoled}>
            <BarChart3 size={20} />
          </TabItem>

          {/* ✅ BADGE DI ACTIVITY */}
          <TabItem
            to="/activity"
            label="Activity"
            amoled={amoled}
            badgeCount={pendingCount}
          >
            <History size={20} />
          </TabItem>

          <TabItem to="/profile" label="Profile" amoled={amoled}>
            <User size={20} />
          </TabItem>
        </div>
      </div>
    </nav>
  );
}

function TabItem({ to, label, children, amoled, badgeCount = 0 }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const base =
          "flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] tracking-wide transition-all duration-200";
        const active = `
          text-emerald-400
          font-medium
        `;
        const inactive = `
          text-zinc-500
          hover:text-zinc-300
        `;
        return `${base} ${isActive ? active : inactive}`;
      }}
    >
      {({ isActive }) => (
        <>
          <div
            className={`
              relative
              mb-[2px]
              inline-flex items-center justify-center
              h-8 w-8 rounded-full
              transition-all duration-200
              ${isActive ? "bg-emerald-500/15" : "bg-transparent"}
            `}
            style={{
              transformOrigin: "center",
              transform: isActive ? "scale(1.05)" : "scale(1.0)",
            }}
          >
            {children}

            {/* ✅ Badge kecil pojok kanan atas icon */}
            {badgeCount > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  min-w-[16px] h-[16px]
                  px-1
                  flex items-center justify-center
                  text-[9px] font-bold
                  rounded-full
                  bg-amber-500 text-black
                  border border-black
                  shadow-md
                "
              >
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </div>

          <span className="leading-none">{label}</span>
        </>
      )}
    </NavLink>
  );
}
