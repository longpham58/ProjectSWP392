/**
 * Course API wrapper cho HR – kết nối trực tiếp backend.
 */

import axios from '../lib/axios';
import type { CourseDto, AddCoursePayload, GetMyCoursesResponse } from './course.api';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type HrTrainerOption = {
  username: string;
  fullName: string;
};

const courseApi = {
  async getMyCourses(): Promise<GetMyCoursesResponse> {
    const res = await axios.get<ApiResponse<CourseDto[]>>('/hr/courses');
    return { success: true, data: res.data.data };
  },

  async addCourse(payload: AddCoursePayload): Promise<CourseDto> {
    const res = await axios.post<ApiResponse<CourseDto>>('/hr/courses', payload);
    return res.data.data;
  },

  async updateCourse(id: number, payload: Partial<AddCoursePayload>): Promise<void> {
    await axios.put<ApiResponse<CourseDto>>(`/hr/courses/${id}`, payload);
  },

  async deleteCourse(id: number): Promise<void> {
    await axios.delete<ApiResponse<void>>(`/hr/courses/${id}`);
  },

  async getTrainers(): Promise<HrTrainerOption[]> {
    const res = await axios.get<ApiResponse<HrTrainerOption[]>>('/hr/courses/trainers');
    return res.data.data ?? [];
  },
};

export default courseApi;
