import { CourseDto, CourseResponse } from './course.api';
import { mockCourses, delay } from '../mocks/mockCourseData';

// Mock API service - không cần backend
export const mockCourseApi = {
  getMyCourses: async (): Promise<CourseResponse> => {
    // Simulate network delay
    await delay(800);
    
    // Simulate API response
    return {
      success: true,
      message: 'Lấy danh sách khóa học thành công',
      data: mockCourses
    };
  },

  // Thêm course mới (mock)
  addCourse: async (course: Partial<CourseDto>): Promise<CourseResponse> => {
    await delay(500);
    
    const newCourse: CourseDto = {
      id: mockCourses.length + 1,
      title: course.title || 'New Course',
      description: course.description || '',
      category: course.category || 'Programming',
      level: course.level || 'Cơ bản',
      durationWeeks: course.durationWeeks || 8,
      maxStudents: course.maxStudents || 20,
      currentStudents: 0,
      image: course.image || '📚',
      status: 'Sắp khai giảng',
      startDate: course.startDate || new Date().toISOString().split('T')[0],
      endDate: course.endDate || new Date().toISOString().split('T')[0],
      trainerName: 'Trần Thị Trainer',
      departmentName: 'IT Department'
    };
    
    mockCourses.push(newCourse);
    
    return {
      success: true,
      message: 'Thêm khóa học thành công',
      data: [newCourse]
    };
  },

  // Xóa course (mock)
  deleteCourse: async (courseId: number): Promise<CourseResponse> => {
    await delay(500);
    
    const index = mockCourses.findIndex(c => c.id === courseId);
    if (index > -1) {
      mockCourses.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Xóa khóa học thành công',
      data: mockCourses
    };
  }
};

export default mockCourseApi;
