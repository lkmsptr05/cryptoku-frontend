// src/hooks/useOrderHistory.js
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

export default function useOrderHistory({ initData }) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async (isLoadMore = false) => {
    if (!initData) return;
    if (isLoadMore && !nextCursor) return;

    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "20");
      if (isLoadMore && nextCursor) {
        params.set("before", nextCursor);
      }

      const res = await fetch(
        `${API_BASE_URL}/orders/history?${params.toString()}`,
        {
          headers: {
            "x-telegram-init-data": initData,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();

      if (isLoadMore) {
        setItems((prev) => [...prev, ...(data.items || [])]);
      } else {
        setItems(data.items || []);
      }

      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("useOrderHistory error:", err);
      setError(err.message || "Gagal memuat riwayat order");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore: !!nextCursor,
    reload: () => fetchOrders(false),
    loadMore: () => fetchOrders(true),
  };
}
