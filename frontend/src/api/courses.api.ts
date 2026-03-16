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
  // Attendance info based on session attendance
  totalSessions?: number;
  attendedSessions?: number;
  progressPercentage?: number;
  className?: string;
  classCode?: string;
}

export interface EmployeeClass {
  classId: number;
  classCode: string;
  className: string;
  courseName: string;
  courseCode: string;
  trainerName: string;
  maxStudents: number;
  currentStudents: number;
  status: string;
  notes: string;
  joinedAt: string;
}

export interface TrainerScheduleItem {
  id: number;
  courseId: number;
  courseName: string;
  className: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  displayOrder: number;
  materials: any[];
  quizzes: any[];
}

export const coursesApi = {
  // Get courses of current user
  getMyCourses: () =>
    axios.get<ApiResponse<Course[]>>("/courses/my"),

  // Get classes of current user
  getMyClasses: () =>
    axios.get<ApiResponse<EmployeeClass[]>>("/employee/dashboard/classes"),

  // Get course by ID
  getCourseById: (courseId: number) =>
    axios.get<ApiResponse<Course>>(`/courses/${courseId}`),

  // Get course modules
  getCourseModules: (courseId: number) =>
    axios.get<ApiResponse<any[]>>(`/courses/${courseId}/modules`),

  // Trainer: Get my courses
  getMyTrainerCourses: () =>
    axios.get<ApiResponse<Course[]>>("/trainer/courses"),

  // Trainer: Get my schedule
  getMyTrainerSchedule: () =>
    axios.get<ApiResponse<TrainerScheduleItem[]>>("/trainer/schedule"),

  // Trainer: Create module
  createModule: (courseId: number, data: { title: string; description: string; displayOrder?: number }) =>
    axios.post<ApiResponse<CourseModule>>(`/trainer/courses/${courseId}/modules`, data),

  // Trainer: Delete module
  deleteModule: (moduleId: number) =>
    axios.delete<ApiResponse<void>>(`/trainer/modules/${moduleId}`),

  // Trainer: Create material
  createMaterial: (moduleId: number, data: { title: string; description?: string; type: string; fileUrl?: string; fileSize?: number }) =>
    axios.post<ApiResponse<any>>(`/trainer/modules/${moduleId}/materials`, data),

  // Trainer: Delete material
  deleteMaterial: (materialId: number) =>
    axios.delete<ApiResponse<void>>(`/trainer/materials/${materialId}`),
};