// Wrapper để tự động chọn giữa Mock API và Real API cho courses
import { USE_MOCK_DATA } from '../config/useMockData';
import { courseApi as realCourseApi } from './course.api';
import type { CourseDto } from './course.api';
import mockCourseApi from './course.api.mock';

export const courseApi = {
  getMyCourses: async () => {
    if (USE_MOCK_DATA) {
      return mockCourseApi.getMyCourses();
    }
    return realCourseApi.getMyCourses();
  },

  addCourse: async (course: Partial<CourseDto>) => {
    if (USE_MOCK_DATA) {
      return mockCourseApi.addCourse(course);
    }
    return realCourseApi.addCourse(course);
  },

  deleteCourse: async (courseId: number) => {
    if (USE_MOCK_DATA) {
      return mockCourseApi.deleteCourse(courseId);
    }
    return realCourseApi.deleteCourse(courseId);
  },

  updateCourse: async (courseId: number, patch: Partial<CourseDto>) => {
    if (USE_MOCK_DATA) {
      return mockCourseApi.updateCourse(courseId, patch);
    }
    return realCourseApi.updateCourse(courseId, patch);
  },
};

export default courseApi;
