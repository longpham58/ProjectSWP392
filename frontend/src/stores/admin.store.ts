import { create } from "zustand";
import { adminApi, AdminDashboardStats } from "../api/admin.api";

interface AdminState {
  dashboardStats: AdminDashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboardStats: null,
  loading: false,
  error: null,

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
}));
