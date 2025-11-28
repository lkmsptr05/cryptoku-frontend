import React, { createContext, useContext, useState, useMemo } from "react";

const PendingTopupContext = createContext(null);

export function PendingTopupProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isTopupTabActive, setIsTopupTabActive] = useState(false);

  const value = useMemo(
    () => ({
      pendingCount,
      setPendingCount,
      isTopupTabActive,
      setIsTopupTabActive,
    }),
    [pendingCount, isTopupTabActive]
  );

  return (
    <PendingTopupContext.Provider value={value}>
      {children}
    </PendingTopupContext.Provider>
  );
}

export function usePendingTopup() {
  const ctx = useContext(PendingTopupContext);
  if (!ctx) {
    throw new Error("usePendingTopup must be used inside PendingTopupProvider");
  }
  return ctx;
}
