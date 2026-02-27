import axiosInstance from '../lib/axios';

export interface CourseDto {
  id: number;
  code: string;
  name: string;
  description: string;
  objectives: string;
  prerequisites: string;
  durationHours: number;
  category: string;
  level: string;
  thumbnailUrl: string;
  passingScore: number;
  maxAttempts: number;
  status: string;
  trainerName: string;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: CourseDto[];
}

export const courseApi = {
  getMyCourses: async (): Promise<CourseResponse> => {
    const response = await axiosInstance.get<CourseResponse>('/api/courses/my-courses');
    return response.data;
  }
};

export default courseApi;
