import { create } from "zustand";
import { notificationApi, Notification } from "../api/notification.api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({

  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });

    try {
      const data = await notificationApi.getMyNotifications();

      const unread = data.filter(n => !n.read).length;

      set({
        notifications: data,
        unreadCount: unread,
        loading: false
      });

    } catch (error) {
      console.error("Failed to fetch notifications", error);
      set({ loading: false });
    }
  },


  markAsRead: async (id: number) => {
    try {
      await notificationApi.markAsRead(id);

      set(state => {
        const updated = state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );

        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      });

    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();

      set(state => ({
        notifications: state.notifications.map(n => ({
          ...n,
          read: true
        })),
        unreadCount: 0
      }));

    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  },

  deleteNotification: async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);

      set(state => {
        const updated = state.notifications.filter(n => n.id !== id);

        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      });

    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  }

}));