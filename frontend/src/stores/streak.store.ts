import { create } from "zustand";
import { streakApi, LearningStreak } from "../api/streak.api";

interface StreakState {
  streak: LearningStreak | null;
  loading: boolean;
  error: string | null;

  fetchStreak: (userId: number) => Promise<void>;
  clearStreak: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  loading: false,
  error: null,

  fetchStreak: async (userId: number) => {
    set({ loading: true, error: null });

    try {
      const res = await streakApi.getUserStreak();

      set({
        streak: res.data.data,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch streak",
        loading: false,
      });
    }
  },

  clearStreak: () => {
    set({ streak: null });
  },
}));