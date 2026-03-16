import { create } from "zustand";
import { streakApi } from "../api/streak.api";

interface StreakState {
  streak: number | null;
  loading: boolean;
  error: string | null;

  fetchStreak: () => Promise<void>;
  clearStreak: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  loading: false,
  error: null,

  fetchStreak: async () => {
    set({ loading: true, error: null });

    try {
      const res = await streakApi.getUserStreak();

      set({
        streak: res.data.data ?? 0,
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