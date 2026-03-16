import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const streakApi = {
  getUserStreak: () =>
    axios.get<ApiResponse<number>>(`/streak/my`),
};
