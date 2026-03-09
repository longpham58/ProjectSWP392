import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface LearningStreak {
  currentStreak: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const streakApi = {
  getUserStreak: () =>
    axios.get<ApiResponse<LearningStreak>>(`/streak/my`),
};