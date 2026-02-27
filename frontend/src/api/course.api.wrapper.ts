// Wrapper để tự động chọn giữa Mock API và Real API cho courses
import { USE_MOCK_DATA } from '../config/useMockData';
import { courseApi as realCourseApi } from './course.api';
import mockCourseApi from './course.api.mock';

export const courseApi = {
  getMyCourses: async () => {
    if (USE_MOCK_DATA) {
      return mockCourseApi.getMyCourses();
    }
    return realCourseApi.getMyCourses();
  }
};

export default courseApi;
