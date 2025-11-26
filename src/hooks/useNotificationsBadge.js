// src/hooks/useNotificationsBadge.js
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

function getInitData() {
  const tgWebApp = window.Telegram?.WebApp;
  return tgWebApp?.initData || "";
}

export default function useNotificationsBadge(pollIntervalMs = 15000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId;

    const fetchNotifications = async () => {
      try {
        const initData = getInitData();
        if (!initData) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          console.warn("Notif fetch failed:", data);
          setLoading(false);
          return;
        }

        const list = data.data || [];
        const unread = list.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Notif fetch error:", err);
      } finally {
        setLoading(false);
        // schedule next poll
        timeoutId = setTimeout(fetchNotifications, pollIntervalMs);
      }
    };

    fetchNotifications();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pollIntervalMs]);

  return { unreadCount, loading };
}
