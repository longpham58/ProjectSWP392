import axiosInstance from '../lib/axios';

export interface CourseDto {
  id: number;
  description: string;
  category: string;
  level: string;
  status: string;
  trainerName: string;
  trainerUsername?: string;
  title: string;
  durationWeeks: number;
  maxStudents: number;
  currentStudents: number;
  image?: string;
  startDate?: string;
  endDate?: string;
  departmentName?: string;
  subjectCode?: string;

  // Optional fields for future backend integration
  code?: string;
  name?: string;
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
  },

  addCourse: async (course: Partial<CourseDto>): Promise<CourseResponse> => {
    const response = await axiosInstance.post<CourseResponse>('/api/courses', course);
    return response.data;
  },

  deleteCourse: async (courseId: number): Promise<CourseResponse> => {
    const response = await axiosInstance.delete<CourseResponse>(`/api/courses/${courseId}`);
    return response.data;
  },

  updateCourse: async (courseId: number, patch: Partial<CourseDto>): Promise<CourseResponse> => {
    const response = await axiosInstance.put<CourseResponse>(`/api/courses/${courseId}`, patch);
    return response.data;
  },
};

export default courseApi;
