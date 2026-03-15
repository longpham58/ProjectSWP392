import { create } from 'zustand';
import * as trainerApi from '../api/notification-trainer.api';
import type { NotificationDto, NotificationRequest } from '../api/notification-trainer.api';

// Define interfaces for trainer notifications
export interface TrainerNotification {
  id: number;
  title: string;
  message: string;
  type: 'GENERAL' | 'URGENT' | 'FEEDBACK' | 'ANNOUNCEMENT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  isDraft: boolean;
  sentDate: string;
  createdAt?: string;
  category?: string;
  sender?: string;
  recipients?: string[];
  recipientType?: string;
  classCodes?: string;
}

export type { NotificationRequest as TrainerNotificationRequest };

interface TrainerNotificationState {
  notifications: TrainerNotification[];
  loading: boolean;
  error: string | null;
  currentCategory: 'inbox' | 'sent' | 'draft';
  
  // Actions
  setCurrentCategory: (category: 'inbox' | 'sent' | 'draft') => void;
  fetchNotifications: (category: 'inbox' | 'sent' | 'draft') => Promise<void>;
  createNotification: (notification: NotificationRequest) => Promise<void>;
  updateNotification: (id: number, notification: NotificationRequest) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useTrainerNotificationStore = create<TrainerNotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  currentCategory: 'inbox',

  setCurrentCategory: (category) => set({ currentCategory: category }),

  fetchNotifications: async (category) => {
    set({ loading: true, error: null });
    try {
      const notifications = await trainerApi.getTrainerNotifications(category);
      set({ notifications: notifications as any, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ 
        error: 'Không thể tải thông báo. Vui lòng thử lại sau.', 
        loading: false 
      });
    }
  },

  createNotification: async (notification) => {
    set({ loading: true, error: null });
    try {
      await trainerApi.createNotification(notification);
      const { currentCategory } = get();
      await get().fetchNotifications(currentCategory);
    } catch (error) {
      console.error('Failed to create notification:', error);
      set({ 
        error: 'Không thể tạo thông báo. Vui lòng thử lại sau.', 
        loading: false 
      });
      throw error;
    }
  },

  updateNotification: async (id, notification) => {
    set({ loading: true, error: null });
    try {
      await trainerApi.updateNotification(id, notification);
      const { currentCategory } = get();
      await get().fetchNotifications(currentCategory);
    } catch (error) {
      console.error('Failed to update notification:', error);
      set({ 
        error: 'Không thể cập nhật thông báo. Vui lòng thử lại sau.', 
        loading: false 
      });
      throw error;
    }
  },

  deleteNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await trainerApi.deleteNotification(id);
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      set({ 
        error: 'Không thể xóa thông báo. Vui lòng thử lại sau.', 
        loading: false 
      });
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      await trainerApi.markNotificationAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    set({ loading: true, error: null });
    try {
      const { notifications } = get();
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(n => trainerApi.markNotificationAsRead(n.id))
      );
      
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        loading: false
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      set({ 
        error: 'Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại sau.', 
        loading: false 
      });
      throw error;
    }
  },

  sendNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await trainerApi.sendNotification(id);
      const { currentCategory } = get();
      await get().fetchNotifications(currentCategory);
    } catch (error) {
      console.error('Failed to send notification:', error);
      set({ 
        error: 'Không thể gửi thông báo. Vui lòng thử lại sau.', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
