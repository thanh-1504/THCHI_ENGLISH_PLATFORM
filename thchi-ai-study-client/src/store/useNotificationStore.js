import { create } from "zustand";
import { notificationService } from "../services/notification.service";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationService.getAll();
      // API trả về array trực tiếp từ Prisma findMany
      set({ notifications: Array.isArray(data) ? data : (data.notifications ?? []), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationService.getUnreadCount();
      // API trả về number trực tiếp từ Prisma count
      set({ unreadCount: typeof data === 'number' ? data : (data.count ?? 0) });
    } catch {
      // silent
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (id) => {
    const notification = get().notifications.find((n) => n.id === id);
    if (!notification || notification.isRead) return;
    await notificationService.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    const unread = get().notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await notificationService.deleteNotification(id);
    set((state) => {
      const removed = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: removed && !removed.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },
}));
