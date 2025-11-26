// src/hooks/useTelegramAuth.js
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export default function useTelegramAuth() {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const u = WebApp.initDataUnsafe?.user || null;
    const raw = WebApp.initData || "";

    setUser(u);
    setInitData(raw);
    setLoading(false);
  }, []);

  return { user, initData, loading };
}
