import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface TrainerCourseDto {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  duration: number;
  level: string;
  status: string;
  maxCapacity: number;
  currentEnrolled: number;
  startDate: string;
  endDate: string;
  trainerName: string;
}

export interface SimpleCourseDto {
  code: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get trainer's courses
 */
export const getTrainerCourses = async (): Promise<TrainerCourseDto[]> => {
  const response = await axios.get<ApiResponse<TrainerCourseDto[]>>(
    `${API_BASE_URL}/trainer/courses`
  );
  return response.data.data;
};

/**
 * Get trainer's courses in simple format
 */
export const getTrainerCoursesSimple = async (): Promise<SimpleCourseDto[]> => {
  const response = await axios.get<ApiResponse<SimpleCourseDto[]>>(
    `${API_BASE_URL}/trainer/courses/simple`
  );
  return response.data.data;
};

// Export as trainerCourseApi object for easier importing
export const trainerCourseApi = {
  getTrainerCourses,
  getTrainerCoursesSimple
};