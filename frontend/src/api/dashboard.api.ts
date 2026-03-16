import axios from "../lib/axios";
import { ApiResponse } from "./courses.api";

export interface Deadline {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
  priority: "high" | "medium" | "low";
  type?: string;
}

export interface RecentActivity {
  id: number;
  type: "quiz" | "course" | "certificate" | "lesson" | "join_class";
  title: string;
  course: string;
  time: string;
  icon?: string;
  color?: string;
}

export interface TodayProgress {
  lessonsCompleted: number;
  lessonsTarget: number;
  studyHours: number;
  studyTarget: number;
  quizzesCompleted: number;
  quizzesTarget: number;
}

export interface LearningStreakData {
  currentStreak: number;
  milestone: number;
  progress: number;
  daysRemaining: number;
}

export interface UserProfileStats {
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  averageScore: number;
}

export const dashboardApi = {
  // Get learning streak with milestone data
  getLearningStreak: () =>
    axios.get<ApiResponse<number>>("streak/my"),

  // Get upcoming deadlines
  getDeadlines: () =>
    axios.get<ApiResponse<Deadline[]>>("employee/dashboard/deadlines"),

  // Get recent activities
  getRecentActivities: () =>
    axios.get<ApiResponse<RecentActivity[]>>("employee/dashboard/recent-activities"),

  // Get today's progress
  getTodayProgress: () =>
    axios.get<ApiResponse<TodayProgress>>("employee/dashboard/today-progress"),

  // Get user profile stats
  getProfileStats: () =>
    axios.get<ApiResponse<UserProfileStats>>("employee/dashboard/profile-stats"),
};