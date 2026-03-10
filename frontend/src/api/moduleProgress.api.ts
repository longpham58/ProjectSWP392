import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface ModuleProgressDto {
  id: number;
  userId: number;
  moduleId: number;
  moduleTitle: string;
  courseId: number;
  courseName: string;
  enrollmentId: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  progressPercentage: number;
  timeSpentMinutes: number;
  lastAccessedAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const moduleProgressApi = {
  /**
   * Get all module progress for a user in a specific course
   */
  getModuleProgress: (userId: number, courseId: number) =>
    axios.get<ApiResponse<ModuleProgressDto[]>>(`/module-progress/user/${userId}/course/${courseId}`),

  /**
   * Mark a module as completed
   */
  completeModule: (userId: number, moduleId: number) =>
    axios.post<ApiResponse<ModuleProgressDto>>("/module-progress/complete", { userId, moduleId }),

  /**
   * Update module progress percentage
   */
  updateProgress: (userId: number, moduleId: number, percentage: number) =>
    axios.put<ApiResponse<ModuleProgressDto>>("/module-progress/update", { userId, moduleId, percentage }),

  /**
   * Check if a specific module is completed
   */
  isModuleCompleted: (userId: number, moduleId: number) =>
    axios.get<ApiResponse<{ isCompleted: boolean }>>(`/module-progress/check/${userId}/${moduleId}`),

  /**
   * Get count of completed modules
   */
  getCompletedModulesCount: (userId: number, courseId: number) =>
    axios.get<ApiResponse<{ count: number }>>(`/module-progress/count/${userId}/${courseId}`),

  /**
   * Check if a quiz is unlocked
   */
  isQuizUnlocked: (userId: number, moduleId: number) =>
    axios.get<ApiResponse<{ unlocked: boolean }>>(`/module-progress/quiz-unlocked/${userId}/${moduleId}`),

  /**
   * Check if final exam is unlocked
   */
  isFinalExamUnlocked: (userId: number, courseId: number) =>
    axios.get<ApiResponse<{ unlocked: boolean }>>(`/module-progress/final-exam-unlocked/${userId}/${courseId}`),
};
