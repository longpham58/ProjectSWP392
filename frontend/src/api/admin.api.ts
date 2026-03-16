import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  openFeedback: number;
  totalCourses: number;
  activeCourses: number;
  totalClasses: number;
  totalEnrollments: number;
}

export const adminApi = {
  getDashboardStats: () =>
    axios.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard"),
};
