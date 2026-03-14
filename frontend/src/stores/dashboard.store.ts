import { create } from "zustand";
import { dashboardApi, Deadline, RecentActivity, TodayProgress } from "../api/dashboard.api";

// Mock data for fallback
const mockDeadlines: Deadline[] = [
  { id: 1, title: 'Quiz 2: Spring Boot Advanced', course: 'Spring Boot Microservices', dueDate: '2026-03-05', daysLeft: 3, priority: 'high' },
  { id: 2, title: 'Final Exam', course: 'React & TypeScript', dueDate: '2026-03-08', daysLeft: 6, priority: 'high' },
  { id: 3, title: 'Quiz 1: Docker Basics', course: 'Docker & Kubernetes', dueDate: '2026-03-12', daysLeft: 10, priority: 'medium' },
];

const mockActivities: RecentActivity[] = [
  { id: 1, type: 'quiz', title: 'Hoàn thành Quiz 1', course: 'Spring Boot Microservices', time: '2 giờ trước', icon: '✅', color: 'green' },
  { id: 2, type: 'course', title: 'Tham gia khóa học mới', course: 'Docker & Kubernetes', time: '1 ngày trước', icon: '📚', color: 'blue' },
  { id: 3, type: 'certificate', title: 'Nhận chứng chỉ', course: 'Python Cơ bản', time: '2 ngày trước', icon: '🏆', color: 'purple' },
  { id: 4, type: 'lesson', title: 'Hoàn thành bài học', course: 'React & TypeScript', time: '3 ngày trước', icon: '📖', color: 'teal' },
];

const mockTodayProgress: TodayProgress = {
  lessonsCompleted: 1,
  lessonsTarget: 5,
  studyHours: 2.5,
  studyTarget: 4,
  quizzesCompleted: 1,
  quizzesTarget: 2
};

interface DashboardState {
  deadlines: Deadline[];
  activities: RecentActivity[];
  todayProgress: TodayProgress | null;
  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
  clearDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  deadlines: [],
  activities: [],
  todayProgress: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });

    try {
      const [deadlinesRes, activitiesRes, progressRes] = await Promise.all([
        dashboardApi.getDeadlines(),
        dashboardApi.getRecentActivities(),
        dashboardApi.getTodayProgress()
      ]);

      // Use API data if available, otherwise fall back to mock data
      const deadlines = deadlinesRes.data.data && deadlinesRes.data.data.length > 0 
        ? deadlinesRes.data.data 
        : mockDeadlines;
      
      const activities = activitiesRes.data.data && activitiesRes.data.data.length > 0 
        ? activitiesRes.data.data 
        : mockActivities;
      
      const todayProgress = progressRes.data.data 
        ? progressRes.data.data 
        : mockTodayProgress;

      set({
        deadlines,
        activities,
        todayProgress,
        loading: false,
      });
    } catch (error: any) {
      // On error, use mock data
      set({
        deadlines: mockDeadlines,
        activities: mockActivities,
        todayProgress: mockTodayProgress,
        error: error?.response?.data?.message || "Failed to fetch dashboard data",
        loading: false,
      });
    }
  },

  clearDashboard: () => {
    set({
      deadlines: [],
      activities: [],
      todayProgress: null,
      error: null,
    });
  },
}));
