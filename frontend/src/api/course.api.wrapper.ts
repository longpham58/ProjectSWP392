/**
 * Course API wrapper for HR dashboard. Uses mock data when backend is unavailable.
 */

import type { CourseDto, AddCoursePayload, GetMyCoursesResponse } from './course.api';
import { mockCourses } from '../data/mockCourses';

// In-memory copy for HR mutations (add/update/delete) so mockCourses stays read-only
const mutableCourses: CourseDto[] = mockCourses.map((c) => ({
  id: c.id,
  code: c.code,
  title: c.name,
  name: c.name,
  status: c.status,
  category: c.category,
}));

let nextId = Math.max(0, ...mockCourses.map((c) => c.id)) + 1;

const courseApi = {
  async getMyCourses(): Promise<GetMyCoursesResponse> {
    const list = mutableCourses.map((c) => ({
      ...c,
      title: c.title ?? c.name,
      name: c.name ?? c.title,
    }));
    return { success: true, data: list };
  },

  async addCourse(payload: AddCoursePayload): Promise<void> {
    const newCourse: CourseDto = {
      id: nextId++,
      code: payload.code ?? `ITMS-${String(nextId).padStart(3, '0')}`,
      title: payload.title ?? payload.name,
      name: payload.name ?? payload.title,
      status: payload.status,
      category: payload.category,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
      subjectCode: payload.subjectCode,
      trainerName: payload.trainerName,
      trainerUsername: payload.trainerUsername,
      departmentName: payload.departmentName,
    };
    mutableCourses.push(newCourse);
  },

  async updateCourse(id: number, payload: Partial<AddCoursePayload>): Promise<void> {
    const idx = mutableCourses.findIndex((c) => c.id === id);
    if (idx === -1) return;
    mutableCourses[idx] = {
      ...mutableCourses[idx],
      ...payload,
      title: payload.title ?? payload.name ?? mutableCourses[idx].title,
      name: payload.name ?? payload.title ?? mutableCourses[idx].name,
    };
  },

  async deleteCourse(id: number): Promise<void> {
    const idx = mutableCourses.findIndex((c) => c.id === id);
    if (idx !== -1) mutableCourses.splice(idx, 1);
  },
};

export default courseApi;
