import { authedGet, authedPatch } from "../request";

export async function getNotifications() {
  const { res, data } = await authedGet("/notifications");

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Gagal mengambil notifikasi");
  }

  return data.data;
}

export async function markNotificationRead(id) {
  return authedPatch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return authedPatch("/notifications/read-all");
}
