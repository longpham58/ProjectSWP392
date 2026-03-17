import { create } from "zustand";
import { adminApi, AdminCourseDto, AdminClassDto, AdminCourseDetailDto } from "../api/admin.api";
import { coursesApi, Course } from "../api/courses.api";

interface CourseState {
  courses: AdminCourseDto[];
  myCourses: Course[];
  classes: AdminClassDto[];
  currentCourse: AdminCourseDetailDto | null;
  loading: boolean;
  error: string | null;
  
  // Courses
  fetchCourses: (status?: string) => Promise<void>;
  fetchCourseById: (id: number) => Promise<void>;
  clearCurrentCourse: () => void;
  
  // My Courses (for employees)
  fetchMyCourses: () => Promise<void>;
  
  // Classes
  fetchClasses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  myCourses: [],
  classes: [],
  currentCourse: null,
  loading: false,
  error: null,

  fetchCourses: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getCourses(status);
      set({ courses: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch courses" });
    } finally {
      set({ loading: false });
    }
  },

  fetchCourseById: async (id: number) => {
    set({ loading: true, error: null, currentCourse: null });
    try {
      const res = await adminApi.getCourseById(id);
      set({ currentCourse: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch course" });
    } finally {
      set({ loading: false });
    }
  },

  clearCurrentCourse: () => {
    set({ currentCourse: null });
  },

  fetchMyCourses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await coursesApi.getMyCourses();
      set({ myCourses: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch my courses" });
    } finally {
      set({ loading: false });
    }
  },

  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.getClasses();
      set({ classes: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch classes" });
    } finally {
      set({ loading: false });
    }
  },
}));
