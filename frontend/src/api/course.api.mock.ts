import { CourseDto, CourseResponse } from './course.api';
import { mockCourses, delay } from '../mocks/mockCourseData';

const STORAGE_KEY = 'itms_mock_courses_v1';

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function loadCourses(): CourseDto[] {
  const stored = safeParse<CourseDto[]>(localStorage.getItem(STORAGE_KEY));
  // Only seed when storage key is missing/uninitialized.
  // If user deleted all courses and storage contains [], keep it empty.
  const initial = (stored && Array.isArray(stored)) ? stored : [...mockCourses];

  const normalizeStatus = (status?: string): string => {
    const s = (status || '').trim().toLowerCase();
    if (!s) return 'Draft';
    if (s === 'draft' || s === 'active' || s === 'inactive' || s === 'cancel') return status!;
    if (s === 'đang diễn ra') return 'Active';
    if (s === 'sắp khai giảng') return 'Draft';
    if (s === 'hoàn thành') return 'Inactive';
    return 'Draft';
  };

  const normalizeCode = (code: string | undefined, id: number, index: number): string => {
    const raw = (code || '').trim();
    if (/^\d+$/.test(raw)) return `ITMS-${raw.padStart(3, '0')}`;
    if (raw) return raw;
    return `ITMS-${String(id || index + 1).padStart(3, '0')}`;
  };

  const normalized = initial.map((c, idx) => {
    const title = c.title || c.name || `Course ${c.id}`;
    return {
      ...c,
      title,
      name: c.name || title,
      code: normalizeCode(c.code, c.id, idx),
      status: normalizeStatus(c.status),
      trainerName: c.trainerName || 'Trần Thị Trainer',
      departmentName: c.departmentName || 'IT Department',
    };
  });

  // persist normalized list (seed/migrate)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function saveCourses(courses: CourseDto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

// Mock API service - không cần backend
export const mockCourseApi = {
  getMyCourses: async (): Promise<CourseResponse> => {
    // Simulate network delay
    await delay(800);
    
    // Simulate API response
    return {
      success: true,
      message: 'Lấy danh sách khóa học thành công',
      data: loadCourses()
    };
  },

  // Thêm course mới (mock)
  addCourse: async (course: Partial<CourseDto>): Promise<CourseResponse> => {
    await delay(500);

    const current = loadCourses();
    const newCourse: CourseDto = {
      id: (current.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1,
      code: course.code || `ITMS-${String((current.length + 1)).padStart(3, '0')}`,
      title: course.title || 'New Course',
      name: course.name || course.title || 'New Course',
      description: course.description || '',
      category: course.category || 'Programming',
      level: course.level || 'Cơ bản',
      durationWeeks: course.durationWeeks || 8,
      maxStudents: course.maxStudents || 20,
      currentStudents: 0,
      image: course.image || '📚',
      status: course.status || 'Sắp khai giảng',
      startDate: course.startDate || new Date().toISOString().split('T')[0],
      endDate: course.endDate || new Date().toISOString().split('T')[0],
      trainerName: course.trainerName || 'Trần Thị Trainer',
      trainerUsername: course.trainerUsername,
      departmentName: course.departmentName || 'IT Department'
    };

    const next = [newCourse, ...current];
    saveCourses(next);
    
    return {
      success: true,
      message: 'Thêm khóa học thành công',
      data: [newCourse]
    };
  },

  // Xóa course (mock)
  deleteCourse: async (courseId: number): Promise<CourseResponse> => {
    await delay(500);

    const current = loadCourses();
    const next = current.filter((c) => c.id !== courseId);
    saveCourses(next);
    
    return {
      success: true,
      message: 'Xóa khóa học thành công',
      data: next
    };
  },

  updateCourse: async (courseId: number, patch: Partial<CourseDto>): Promise<CourseResponse> => {
    await delay(500);
    const current = loadCourses();
    const idx = current.findIndex((c) => c.id === courseId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy khóa học', data: current };
    }

    const updated: CourseDto = {
      ...current[idx],
      ...patch,
      id: current[idx].id,
    };

    const next = [...current];
    next[idx] = updated;
    saveCourses(next);

    return {
      success: true,
      message: 'Cập nhật khóa học thành công',
      data: [updated],
    };
  },
};

export default mockCourseApi;
