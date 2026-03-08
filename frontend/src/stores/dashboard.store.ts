import { create } from "zustand";
import { dashboardApi, Deadline, RecentActivity, TodayProgress } from "../api/dashboard.api";

interface DashboardState {
  deadlines: Deadline[];
  activities: RecentActivity[];
  todayProgress1: TodayProgress | null;

  loading: boolean;
  error: string | null;


  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  deadlines: [],
  activities: [],
  todayProgress1: null,

  loading: false,
  error: null,

  

  // Fetch everything together
  fetchDashboard: async () => {
    try {
      set({ loading: true });

      const [deadlinesRes, activitiesRes, progressRes] = await Promise.all([
        dashboardApi.getDeadlines(),
        dashboardApi.getRecentActivities(),
        dashboardApi.getTodayProgress(),
      ]);

      set({
        deadlines: deadlinesRes.data.data,
        activities: activitiesRes.data.data,
        todayProgress1: progressRes.data.data,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));