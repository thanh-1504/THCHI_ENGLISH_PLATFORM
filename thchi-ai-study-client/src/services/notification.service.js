import api from "../lib/axios";

export const notificationService = {
  getAll: () => api.get("/notifications").then((res) => res.data),
  getUnreadCount: () =>
    api.get("/notifications/unread-count").then((res) => res.data),
  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((res) => res.data),
  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`).then((res) => res.data),
};
