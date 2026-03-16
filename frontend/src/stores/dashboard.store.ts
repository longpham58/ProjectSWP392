import { create } from "zustand";
import { dashboardApi, Deadline, RecentActivity, TodayProgress } from "../api/dashboard.api";

interface DashboardState {
  deadlines: Deadline[];
  activities: RecentActivity[];
  todayProgress: TodayProgress | null;
  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
  clearDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  deadlines: [],
  activities: [],
  todayProgress: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });

    try {
      const [deadlinesRes, activitiesRes, progressRes] = await Promise.all([
        dashboardApi.getDeadlines(),
        dashboardApi.getRecentActivities(),
        dashboardApi.getTodayProgress()
      ]);

      set({
        deadlines: deadlinesRes.data.data || [],
        activities: activitiesRes.data.data || [],
        todayProgress: progressRes.data.data || null,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch dashboard data",
        loading: false,
      });
    }
  },

  clearDashboard: () => {
    set({
      deadlines: [],
      activities: [],
      todayProgress: null,
      error: null,
    });
  },
}));
