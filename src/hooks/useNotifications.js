// src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api";

// Pakai default export biar enak di-import: import useNotifications from ...
export default function useNotifications() {
  const [items, setItems] = useState([]);
  console.log(items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications(); // dari services/api
      setItems(data || []);
    } catch (err) {
      console.error("[useNotifications] error:", err);
      setError(err.message || "Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAsRead = async (notifId) => {
    const target = items.find((n) => n.id === notifId);
    if (!target || target.is_read) return;

    // optimistic update
    setItems((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );

    try {
      await markNotificationRead(notifId);
    } catch (err) {
      console.error("[useNotifications] markAsRead failed:", err);
      // kalau mau rollback, bisa tambahin di sini
    }
  };

  const markAllAsRead = async () => {
    // optimistic update
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("[useNotifications] markAllAsRead failed:", err);
    }
  };

  return {
    items,
    loading,
    error,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
