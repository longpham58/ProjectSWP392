/**
 * Course API types for HR course/schedule management.
 */

export interface CourseDto {
  id: number;
  code?: string;
  title?: string;
  name?: string;
  status?: string;
  category?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  subjectCode?: string;
  trainer?: string;
  trainerId?: number;
  trainerName?: string;
  trainerUsername?: string;
  departmentName?: string;
  durationHours?: number;
}

export interface GetMyCoursesResponse {
  success: boolean;
  data: CourseDto[];
}

export interface AddCoursePayload {
  code?: string;
  title?: string;
  name?: string;
  subjectCode?: string;
  category?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  trainerName?: string;
  trainerUsername?: string;
  departmentName?: string;
  durationHours?: number;
}
