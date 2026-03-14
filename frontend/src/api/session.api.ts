import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

// Course Schedule from API
export interface CourseSchedule {
  id: number;
  courseId: number;
  sessionNumber: number;
  title: string;
  date: string;
  time: string;
  slot: number;
  location: string;
  instructor: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  dayOfWeek: number;
}

export const sessionApi = {
  // Get course schedule for current user
  getCourseSchedule: () =>
    axios.get<ApiResponse<CourseSchedule[]>>(`/sessions/schedule`),

  // Get course schedule for specific course
  getCourseScheduleByCourse: (courseId: number) =>
    axios.get<ApiResponse<CourseSchedule[]>>(`/sessions/schedule/course/${courseId}`),
};
