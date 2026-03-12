import { create } from "zustand";
import { notificationApi, Notification } from "../api/notification.api";
import { mockNotifications } from "../data/mockNotifications";

// Helper function to compute actionUrl based on referenceType
const computeActionUrl = (referenceType: string | null | undefined, referenceId: number | null | undefined): string | undefined => {
  if (!referenceType || !referenceId) {
    return undefined;
  }
  
  switch (referenceType) {
    case 'COURSE':
      return `/employee/courses/${referenceId}`;
    case 'QUIZ':
      return `/employee/quiz/${referenceId}`;
    case 'CERTIFICATE':
      return `/employee/certificates/${referenceId}`;
    case 'SESSION':
      return `/employee/schedule/${referenceId}`;
    case 'ENROLLMENT':
      return `/employee/courses/${referenceId}`;
    default:
      return undefined;
  }
};

// Helper function to compute relatedCourse display text
const computeRelatedCourse = (referenceType: string | null | undefined, referenceId: number | null | undefined): string | undefined => {
  if (!referenceType || !referenceId) {
    return undefined;
  }
  
  if (referenceType === 'COURSE' || referenceType === 'ENROLLMENT') {
    return `Course #${referenceId}`;
  }
  return undefined;
};

// Transform notification to add computed fields
const transformNotification = (notification: Notification): Notification => {
  return {
    ...notification,
    actionUrl: notification.actionUrl || computeActionUrl(notification.referenceType, notification.referenceId),
    relatedCourse: notification.relatedCourse || computeRelatedCourse(notification.referenceType, notification.referenceId)
  };
};

interface NotificationState {
  notifications: Notification[];
  currentNotification: Notification | null;
  unreadCount: number;
  loading: boolean;
  loadingDetail: boolean;

  fetchNotifications: () => Promise<void>;
  getNotificationById: (id: number) => Promise<Notification | null>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({

  notifications: [],
  currentNotification: null,
  unreadCount: 0,
  loading: false,
  loadingDetail: false,

  fetchNotifications: async () => {
    set({ loading: true });

    try {
      const data = await notificationApi.getMyNotifications();

      // Transform notifications to add computed fields
      const notifications = data.length > 0 
        ? data.map(transformNotification) 
        : mockNotifications.map(transformNotification);
      const unread = notifications.filter(n => !n.read).length;

      set({
        notifications: notifications,
        unreadCount: unread,
        loading: false
      });

    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // Fallback to mock data on error
      const notifications = mockNotifications.map(transformNotification);
      const unread = notifications.filter(n => !n.read).length;
      set({
        notifications: notifications,
        unreadCount: unread,
        loading: false
      });
    }
  },


  getNotificationById: async (id: number) => {
    set({ loadingDetail: true });

    try {
      const notification = await notificationApi.getNotificationById(id);
      // Transform to add computed fields
      const transformed = transformNotification(notification);
      set({ currentNotification: transformed, loadingDetail: false });
      return transformed;
    } catch (error) {
      console.error("Failed to fetch notification", error);
      set({ loadingDetail: false });
      return null;
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