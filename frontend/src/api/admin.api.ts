import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface MonthlyCompletion {
  month: string;
  completions: number;
}

export interface RecentActivity {
  description: string;
  timeAgo: string;
  count?: number;
}

// Analytics DTO
export interface DepartmentCompletion {
  name: string;
  totalUsers: number;
  completedUsers: number;
  completionRate: number;
}

export interface CourseCompletion {
  name: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface TrainingHours {
  month: string;
  totalHours: number;
  avgHoursPerUser: number;
}

export interface AdminAnalyticsDto {
  totalEmployees: number;
  lockedAccounts: number;
  totalClasses: number;
  totalEnrollments: number;
  securityAlerts: number;
  monthlyCompletion: MonthlyCompletion[];
  departmentCompletion: DepartmentCompletion[];
  courseCompletion: CourseCompletion[];
  trainingHours: TrainingHours[];
}

// Notification DTO
export interface AdminNotificationDto {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  targetRole: string;
  sentDate: string;
  expiresAt: string;
  recipientCount: number;
  readCount: number;
  status: string;
  senderName: string;
  senderId: number;
}

// Feedback DTO

export type FeedbackStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface FeedbackDto {
  id: number;
  status?: FeedbackStatus;
  adminResponse?: string;
  // Course feedback fields
  courseId?: number;
  courseRating?: number;
  trainerRating?: number;
  contentRating?: number;
  overallRating?: number;
  userId?: number;
  comments?: string;
  suggestions?: string;
  wouldRecommend?: boolean;
  isAnonymous: boolean;
  userName?: string;
  userEmail?: string;
  submittedAt?: string;
}

export type CourseStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface AdminCourseDto {
  id: number;
  code: string;
  name: string;
  description: string;
  durationHours: number;
  category: string;
  level: Level;
  passingScore: number;
  maxAttempts: number;
  status: CourseStatus;
  trainerName: string;
  createdAt: string;
  updatedAt: string;
  classCount: number;
  studentCount: number;
}

export interface AdminClassDto {
  id: number;
  classCode: string;
  className: string;
  courseName: string;
  courseId: number;
  courseCode: string;
  trainerName: string;
  trainerId: number;
  maxStudents: number;
  status: string;
  notes: string;
  createdAt: string;
  studentCount: number;
}

export type MaterialType = "PDF" | "VIDEO" | "DOCUMENT" | "LINK" | "IMAGE" | "AUDIO";

export interface MaterialDto {
  id: number;
  title: string;
  description: string;
  type: MaterialType;
  fileUrl: string;
  fileSize: number;
  displayOrder: number;
  isRequired: boolean;
  isDownloadable: boolean;
  createdAt: string;
}

export interface AdminCourseDetailDto extends AdminCourseDto {
  objectives: string;
  prerequisites: string;
  updatedAt: string;
  trainerId: number;
  materials: MaterialDto[];
}

export interface AdminDashboardStats {
  // User Stats
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  
  // Security
  failedLoginAttempts: number;
  securityAlerts: number;
  
  // Content Stats
  totalCourses: number;
  activeCourses: number;
  totalClasses: number;
  totalEnrollments: number;
  
  // Feedback
  openFeedback: number;
  
  // Charts Data
  roleDistribution: Record<string, number>;
  monthlyCompletion: MonthlyCompletion[];
  recentActivities: RecentActivity[];
}

export const adminApi = {
  getDashboardStats: () =>
    axios.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard"),

  getAnalytics: () =>
    axios.get<ApiResponse<AdminAnalyticsDto>>("/admin/analytics"),

  getCourses: (status?: string) =>
    axios.get<ApiResponse<AdminCourseDto[]>>("/admin/courses", {
      params: status && status !== "ALL" ? { status } : {},
    }),

  getClasses: () =>
    axios.get<ApiResponse<AdminClassDto[]>>("/admin/classes"),

  getCourseById: (id: number) =>
    axios.get<ApiResponse<AdminCourseDetailDto>>(`/admin/courses/${id}`),

  // Notifications
  getNotifications: (isDraft?: boolean) =>
    axios.get<ApiResponse<AdminNotificationDto[]>>("/admin/notifications", {
      params: isDraft !== undefined ? { isDraft } : {},
    }),

  getNotificationById: (id: number) =>
    axios.get<ApiResponse<AdminNotificationDto>>(`/admin/notifications/${id}`),

  createNotification: (data: Partial<AdminNotificationDto>) =>
    axios.post<ApiResponse<AdminNotificationDto>>("/admin/notifications", data),

  updateNotification: (id: number, data: Partial<AdminNotificationDto>) =>
    axios.put<ApiResponse<AdminNotificationDto>>(`/admin/notifications/${id}`, data),

  sendNotification: (id: number) =>
    axios.post<ApiResponse<AdminNotificationDto>>(`/admin/notifications/${id}/send`),

  deleteNotification: (id: number) =>
    axios.delete<ApiResponse<void>>(`/admin/notifications/${id}`),

  // Feedback
  getAllFeedback: () =>
    axios.get<ApiResponse<FeedbackDto[]>>("/admin/feedback"),

  // System Feedback (new)
  getSystemFeedback: () =>
    axios.get<ApiResponse<FeedbackDto[]>>("/admin/feedback/system"),

  createSystemFeedback: (data: Partial<FeedbackDto>) =>
    axios.post<ApiResponse<FeedbackDto>>("/admin/feedback/system", data),
};
