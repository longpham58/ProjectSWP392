import { create } from "zustand";
import { dashboardApi } from "../api/dashboard.api";

interface ProfileStats {
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  averageScore: number;
}

interface ProfileState {
  profileStats: ProfileStats;
  loading: boolean;
  error: string | null;

  fetchProfileStats: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileStats: {
    totalCourses: 0,
    completedCourses: 0,
    certificates: 0,
    averageScore: 0,
  },
  loading: false,
  error: null,

  fetchProfileStats: async () => {
    set({ loading: true, error: null });

    try {
      const response = await dashboardApi.getProfileStats();
      set({
        profileStats: response.data.data,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch profile stats", error);
      set({
        error: "Failed to load profile stats",
        loading: false,
      });
    }
  },
}));
