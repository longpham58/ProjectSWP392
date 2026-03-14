import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface Feedback {
  id: number;
  user: string;
  rating: number;
  comment: string;
}

export interface Material {
  id: number;
  title: string;
  type: string;
  is_required: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  title?: string; // Alias for name
  description: string;
  objectives: string;
  prerequisites: string;
  duration_hours: number;
  duration?: string; // Human readable duration
  trainer: string;
  instructor?: string; // Alias for trainer
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  thumbnail_url: string;
  passing_score: number;
  max_attempts: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  created_at: string;
  startDate?: string;
  endDate?: string;
  enrolled?: boolean;
  progress?: number;
  score?: number;
  materials: Material[];
  feedbacks: Feedback[];
}

export const coursesApi = {
  // Get courses of current user
  getMyCourses: () =>
    axios.get<ApiResponse<Course[]>>("/courses/my"),

  // Get course by ID
  getCourseById: (courseId: number) =>
    axios.get<ApiResponse<Course>>(`/courses/${courseId}`),

  // Get course modules
  getCourseModules: (courseId: number) =>
    axios.get<ApiResponse<any[]>>(`/courses/${courseId}/modules`),
};