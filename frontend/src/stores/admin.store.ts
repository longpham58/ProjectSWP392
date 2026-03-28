import { create } from "zustand";
import { adminApi, AdminDashboardStats, AdminCourseDto, AdminClassDto, AdminAnalyticsDto, AdminNotificationDto, FeedbackDto } from "../api/admin.api";

interface AdminState {
  dashboardStats: AdminDashboardStats | null;
  analytics: AdminAnalyticsDto | null;
  courses: AdminCourseDto[];
  classes: AdminClassDto[];
  currentCourse: AdminCourseDto | null;
  loading: boolean;
  error: string | null;
  
  // Feedback
  feedbackList: FeedbackDto[];
  fetchAllFeedback: () => Promise<void>;
  deleteFeedback: (id: number) => Promise<void>;
  
  // Dashboard
  fetchDashboardStats: () => Promise<void>;
  
  // Analytics
  fetchAnalytics: () => Promise<void>;
  
  // Courses
  fetchCourses: (status?: string) => Promise<void>;
  fetchCourseById: (id: number) => Promise<void>;
  clearCurrentCourse: () => void;
  
  // Classes
  fetchClasses: () => Promise<void>;
  
  // Notifications
  notifications: AdminNotificationDto[];
  fetchNotifications: (isDraft?: boolean) => Promise<void>;
  createNotification: (data: Partial<AdminNotificationDto>) => Promise<AdminNotificationDto | null>;
  updateNotification: (id: number, data: Partial<AdminNotificationDto>) => Promise<AdminNotificationDto | null>;
  sendNotification: (id: number) => Promise<AdminNotificationDto | null>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  dashboardStats: null,
  analytics: null,
  courses: [],
  classes: [],
  currentCourse: null,
  loading: false,
  error: null,
  notifications: [],
  feedbackList: [],

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getDashboardStats();
      set({ dashboardStats: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch dashboard stats" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getAnalytics();
      set({ analytics: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch analytics" });
    } finally {
      set({ loading: false });
    }
  },

  fetchCourses: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getCourses(status);
      set({ courses: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch courses" });
    } finally {
      set({ loading: false });
    }
  },

  fetchCourseById: async (id: number) => {
    set({ loading: true, error: null, currentCourse: null });
    try {
      const res = await adminApi.getCourseById(id);
      set({ currentCourse: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch course" });
    } finally {
      set({ loading: false });
    }
  },

  clearCurrentCourse: () => {
    set({ currentCourse: null });
  },

  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getClasses();
      set({ classes: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch classes" });
    } finally {
      set({ loading: false });
    }
  },

  // Notifications

  fetchNotifications: async (isDraft?: boolean) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getNotifications(isDraft);
      set({ notifications: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch notifications", loading: false });
    }
  },

  createNotification: async (data: Partial<AdminNotificationDto>) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.createNotification(data);
      const notifications = get().notifications;
      set({ notifications: [...notifications, res.data.data], loading: false });
      return res.data.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to create notification", loading: false });
      return null;
    }
  },

  updateNotification: async (id: number, data: Partial<AdminNotificationDto>) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.updateNotification(id, data);
      const notifications = get().notifications;
      set({
        notifications: notifications.map((n: AdminNotificationDto) => (n.id === id ? res.data.data : n)),
        loading: false,
      });
      return res.data.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to update notification", loading: false });
      return null;
    }
  },

  sendNotification: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.sendNotification(id);
      const notifications = get().notifications;
      set({
        notifications: notifications.map((n: AdminNotificationDto) => (n.id === id ? res.data.data : n)),
        loading: false,
      });
      return res.data.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to send notification", loading: false });
      return null;
    }
  },

  deleteNotification: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await adminApi.deleteNotification(id);
      const notifications = get().notifications;
      set({ notifications: notifications.filter((n: AdminNotificationDto) => n.id !== id), loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete notification", loading: false });
      throw err;
    }
  },

  // Feedback
  fetchAllFeedback: async () => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getAllFeedback();
      set({ feedbackList: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch feedback", loading: false });
    }
  },

  deleteFeedback: async (id: number) => {
    try {
      await adminApi.deleteFeedback(id);
      set(state => ({ feedbackList: state.feedbackList.filter(fb => fb.id !== id) }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete feedback" });
    }
  },
}));
