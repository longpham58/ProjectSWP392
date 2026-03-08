import axios from "../lib/axios";
import { ApiResponse } from "./courses.api";

export interface Deadline {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
  priority: "high" | "medium" | "low";
}

export interface RecentActivity {
  id: number;
  type: "quiz" | "course" | "certificate" | "lesson";
  title: string;
  course: string;
  time: string;
}

export interface TodayProgress {
  lessonsCompleted: number;
  lessonsTarget: number;
  studyHours: number;
  studyTarget: number;
  quizzesCompleted: number;
  quizzesTarget: number;
}


export const dashboardApi = {

  // Get upcoming deadlines
  getDeadlines: () =>
    axios.get<ApiResponse<Deadline[]>>("employee/dashboard/deadlines"),

  // Get recent activities
  getRecentActivities: () =>
    axios.get<ApiResponse<RecentActivity[]>>("employee/dashboard/recent-activities"),

  // Get today's progress
  getTodayProgress: () =>
    axios.get<ApiResponse<TodayProgress>>("employee/dashboard/today-progress"),
};