import { create } from 'zustand';
import { trainerNotificationApi, TrainerNotificationDto, TrainerNotificationRequest } from '../api/trainerNotification.api';

interface TrainerNotificationState {
  notifications: TrainerNotificationDto[];
  loading: boolean;
  error: string | null;
  currentCategory: 'inbox' | 'sent' | 'draft';
  
  // Actions
  setCurrentCategory: (category: 'inbox' | 'sent' | 'draft') => void;
  fetchNotifications: (category: 'inbox' | 'sent' | 'draft') => Promise<void>;
  createNotification: (data: TrainerNotificationRequest) => Promise<void>;
  updateNotification: (id: number, data: TrainerNotificationRequest) => Promise<void>;
  sendNotification: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useTrainerNotificationStore = create<TrainerNotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  currentCategory: 'inbox',

  setCurrentCategory: (category) => {
    set({ currentCategory: category });
  },

  fetchNotifications: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await trainerNotificationApi.getNotifications(category);
      set({ 
        notifications: response.data,
        currentCategory: category,
        loading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch notifications',
        loading: false 
      });
      throw err;
    }
  },

  createNotification: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await trainerNotificationApi.createNotification(data);
      const newNotification = response.data;
      
      // Add to list if it matches current category
      const { currentCategory, notifications } = get();
      if (newNotification.category === currentCategory) {
        set({ 
          notifications: [newNotification, ...notifications],
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to create notification',
        loading: false 
      });
      throw err;
    }
  },

  updateNotification: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await trainerNotificationApi.updateNotification(id, data);
      const updatedNotification = response.data;
      
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? updatedNotification : n
        ),
        loading: false
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to update notification',
        loading: false 
      });
      throw err;
    }
  },

  sendNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await trainerNotificationApi.sendNotification(id);
      
      // Remove from current list (it moves from draft to sent)
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        loading: false
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to send notification',
        loading: false 
      });
      throw err;
    }
  },

  deleteNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await trainerNotificationApi.deleteNotification(id);
      
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        loading: false
      }));
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to delete notification',
        loading: false 
      });
      throw err;
    }
  },

  markAsRead: async (id) => {
    try {
      await trainerNotificationApi.markAsRead(id);
      
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to mark as read' });
      throw err;
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    
    try {
      // Mark all as read in parallel
      await Promise.all(unreadIds.map(id => trainerNotificationApi.markAsRead(id)));
      
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to mark all as read' });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
