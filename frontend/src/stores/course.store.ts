import { create } from "zustand";
import { coursesApi, Course } from "../api/courses.api";
import { mockCourses } from "../data/mockCourses";
import { mockCourseModules } from "../mocks/quiz.mock";

interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  completed?: boolean;
  documents?: any[];
  videos?: any[];
  quizzes?: any[];
  materials?: any[];
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  modules: CourseModule[];
  loading: boolean;
  error: string | null;

  fetchMyCourses: () => Promise<void>;
  fetchCourseDetail: (courseId: number) => Promise<void>;
  clearCourseDetail: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  modules: [],
  loading: false,
  error: null,

  fetchMyCourses: async () => {
    set({ loading: true, error: null });

    try {
      const res = await coursesApi.getMyCourses();
      
      // Use API data if available, otherwise fall back to mock data
      const courses = res.data.data && res.data.data.length > 0 
        ? res.data.data 
        : mockCourses;

      set({
        courses,
        loading: false
      });
    } catch (error: any) {
      // On error, use mock data
      set({
        courses: mockCourses,
        error: error?.response?.data?.message || "Failed to fetch courses",
        loading: false
      });
    }
  },

  fetchCourseDetail: async (courseId: number) => {
    set({ loading: true, error: null });

    try {
      // Fetch course and modules in parallel
      const [courseRes, modulesRes] = await Promise.all([
        coursesApi.getCourseById(courseId),
        coursesApi.getCourseModules(courseId),
      ]);

      // Use API data if available, otherwise fall back to mock data
      const currentCourse = courseRes.data.data || mockCourses.find(c => c.id === courseId) || null;
      
      // Convert API modules format to match our expected format
      let modules: CourseModule[] = [];
      if (modulesRes.data.data && modulesRes.data.data.length > 0) {
        modules = modulesRes.data.data.map((m: any) => ({
          ...m,
          // Convert materials array to documents/videos/quizzes if needed
          documents: m.materials?.filter((mat: any) => ['PDF', 'DOCX', 'PPTX'].includes(mat.type)) || [],
          videos: m.materials?.filter((mat: any) => mat.type === 'VIDEO') || [],
          quizzes: m.quizzes || []
        }));
      } else {
        // Use mock modules from quiz.mock.ts
        modules = mockCourseModules.filter(m => m.courseId === courseId).map(m => ({
          ...m,
          // Convert documents/videos to materials array for compatibility
          materials: [
            ...(m.documents || []),
            ...(m.videos || [])
          ]
        }));
      }

      set({ 
        currentCourse, 
        modules,
        loading: false 
      });
    } catch (error: any) {
      // On error, use mock data
      const mockCourse = mockCourses.find(c => c.id === courseId);
      const mockModules = mockCourseModules.filter(m => m.courseId === courseId).map(m => ({
        ...m,
        materials: [
          ...(m.documents || []),
          ...(m.videos || [])
        ]
      }));
      
      set({
        currentCourse: mockCourse || null,
        modules: mockModules,
        error: error?.response?.data?.message || "Failed to fetch course details",
        loading: false,
      });
    }
  },

  clearCourseDetail: () => {
    set({ currentCourse: null, modules: [], error: null });
  },
}));
