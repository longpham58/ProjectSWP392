import { create } from "zustand";
import { coursesApi, Course, TrainerScheduleItem } from "../api/courses.api";
import { moduleProgressApi } from "../api/moduleProgress.api";

interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  name?: string; // Alias for title
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
  
  // Trainer-specific state
  trainerCourses: Course[];
  trainerSchedule: TrainerScheduleItem[];
  trainerLoading: boolean;
  // Trainer module management
  trainerModules: CourseModule[];
  trainerModulesLoading: boolean;
  trainerSaving: boolean;

  fetchMyCourses: (userId?: number) => Promise<void>;
  fetchCourseDetail: (courseId: number) => Promise<void>;
  clearCourseDetail: () => void;
  
  // Trainer-specific actions
  fetchTrainerCourses: () => Promise<void>;
  fetchTrainerSchedule: () => Promise<void>;
  fetchTrainerModules: (courseId: number) => Promise<void>;
  createTrainerModule: (courseId: number, data: { title: string; description: string; displayOrder?: number }) => Promise<boolean>;
  deleteTrainerModule: (moduleId: number) => Promise<boolean>;
  createTrainerMaterial: (moduleId: number, data: { title: string; description?: string; type: string; fileUrl?: string; fileSize?: number }) => Promise<boolean>;
  deleteTrainerMaterial: (materialId: number) => Promise<boolean>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  modules: [],
  loading: false,
  error: null,
  
  // Trainer-specific state
  trainerCourses: [],
  trainerSchedule: [],
  trainerLoading: false,
  // Trainer module management
  trainerModules: [],
  trainerModulesLoading: false,
  trainerSaving: false,

  fetchMyCourses: async (userId?: number) => {
    set({ loading: true, error: null });

    try {
      const res = await coursesApi.getMyCourses();
      
      // Use API data only
      let courses = res.data.data && res.data.data.length > 0 
        ? res.data.data 
        : [];

      // Fetch progress for each course if userId is provided
      if (userId && userId > 0 && courses.length > 0) {
        try {
          // Fetch progress for all courses in parallel
          const progressResults = await Promise.all(
            courses.map(async (course: Course) => {
              try {
                const progressRes = await moduleProgressApi.getCourseProgress(userId, course.id);
                if (progressRes.data?.data) {
                  return { courseId: course.id, progress: progressRes.data.data.progressPercentage };
                }
              } catch (e) {
                // Progress fetch failed
              }
              return { courseId: course.id, progress: null };
            })
          );
          
          // Apply progress to courses - use API progress if available, otherwise keep existing
          progressResults.forEach(result => {
            const course = courses.find(c => c.id === result.courseId);
            if (course) {
              // Set progress if API returned a valid value, otherwise keep existing
              if (result.progress !== null) {
                course.progress = result.progress;
                
              } else if (course.progress === undefined) {
                course.progress = 0;
              }
            }
          });
        } catch (progressError) {
          console.warn('Failed to fetch course progress:', progressError);
        }
      }

      set({ courses, loading: false });
    } catch (error: any) {
      // On error, set empty array
      set({
        courses: [],
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

      // Use API data only
      const currentCourse = courseRes.data.data || null;
      
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
        // No modules from API
        modules = [];
      }

      set({ 
        currentCourse, 
        modules,
        loading: false 
      });
    } catch (error: any) {
      // On error, set empty values
      set({
        currentCourse: null,
        modules: [],
        error: error?.response?.data?.message || "Failed to fetch course details",
        loading: false,
      });
    }
  },

  clearCourseDetail: () => {
    set({ currentCourse: null, modules: [], error: null });
  },
  
  // Trainer-specific actions
  fetchTrainerCourses: async () => {
    set({ trainerLoading: true, error: null });
    try {
      const response = await coursesApi.getMyTrainerCourses();
      // Use API data if available, otherwise use empty array
      if (response.data.data && response.data.data.length > 0) {
        set({ trainerCourses: response.data.data, trainerLoading: false });
      } else {
        // Fallback to empty if no API data
        console.log('API returned empty courses for trainer');
        set({ trainerCourses: [], trainerLoading: false });
      }
    } catch (error: any) {
      console.log('fetchTrainerCourses API failed - using empty list');
      set({ trainerCourses: [], trainerLoading: false, error: error.message });
    }
  },

  fetchTrainerSchedule: async () => {
    set({ trainerLoading: true, error: null });
    try {
      const response = await coursesApi.getMyTrainerSchedule();
      // Use API data if available
      if (response.data.data && response.data.data.length > 0) {
        set({ trainerSchedule: response.data.data, trainerLoading: false });
      } else {
        // Fallback to empty if no API data
        console.log('API returned empty schedule for trainer');
        set({ trainerSchedule: [], trainerLoading: false });
      }
    } catch (error: any) {
      console.log('fetchTrainerSchedule API failed - using empty list');
      set({ trainerSchedule: [], trainerLoading: false, error: error.message });
    }
  },
  
  // Trainer module management
  fetchTrainerModules: async (courseId: number) => {
    set({ trainerModulesLoading: true, error: null });
    try {
      const response = await coursesApi.getCourseModules(courseId);
      // Use API data if available
      if (response.data.data && response.data.data.length > 0) {
        const modules = response.data.data.map((m: any) => ({
          id: m.id,
          courseId: courseId,
          title: m.title,
          description: m.description,
          order: m.displayOrder || 0,
          materials: m.materials || [],
          quizzes: m.quizzes || []
        }));
        set({ trainerModules: modules, trainerModulesLoading: false });
      } else {
        // Empty modules from API
        set({ trainerModules: [], trainerModulesLoading: false });
      }
    } catch (error: any) {
      console.log('fetchTrainerModules API failed - using empty list');
      set({ trainerModules: [], trainerModulesLoading: false, error: error.message });
    }
  },

  createTrainerModule: async (courseId: number, data: { title: string; description: string; displayOrder?: number }) => {
    set({ trainerSaving: true, error: null });
    try {
      const response = await coursesApi.createModule(courseId, data);
      if (response.data.data) {
        // Add the new module to the list
        const newModule = {
          id: response.data.data.id,
          courseId: courseId,
          title: response.data.data.title,
          description: response.data.data.description,
          order: response.data.data.displayOrder || 0,
          materials: [],
          quizzes: []
        };
        set(state => ({ 
          trainerModules: [...state.trainerModules, newModule],
          trainerSaving: false 
        }));
        return true;
      }
      set({ trainerSaving: false });
      return false;
    } catch (error: any) {
      console.log('createTrainerModule API failed');
      set({ trainerSaving: false, error: error.message });
      // Fallback to local state update
      const newModule = {
        id: Date.now(),
        courseId: courseId,
        title: data.title,
        description: data.description,
        order: data.displayOrder || get().trainerModules.length + 1,
        materials: [],
        quizzes: []
      };
      set(state => ({ 
        trainerModules: [...state.trainerModules, newModule],
        trainerSaving: false 
      }));
      return true;
    }
  },

  deleteTrainerModule: async (moduleId: number) => {
    set({ trainerSaving: true, error: null });
    try {
      await coursesApi.deleteModule(moduleId);
      set(state => ({ 
        trainerModules: state.trainerModules.filter(m => m.id !== moduleId),
        trainerSaving: false 
      }));
      return true;
    } catch (error: any) {
      console.log('deleteTrainerModule API failed');
      set({ trainerSaving: false, error: error.message });
      // Fallback to local state update
      set(state => ({ 
        trainerModules: state.trainerModules.filter(m => m.id !== moduleId),
        trainerSaving: false 
      }));
      return true;
    }
  },

  createTrainerMaterial: async (moduleId: number, data: { title: string; description?: string; type: string; fileUrl?: string; fileSize?: number }) => {
    set({ trainerSaving: true, error: null });
    try {
      const response = await coursesApi.createMaterial(moduleId, data);
      if (response.data.data) {
        // Add the new material to the module
        const newMaterial = response.data.data;
        set(state => ({
          trainerModules: state.trainerModules.map(m => 
            m.id === moduleId 
              ? { ...m, materials: [...(m.materials || []), newMaterial] }
              : m
          ),
          trainerSaving: false
        }));
        return true;
      }
      set({ trainerSaving: false });
      return false;
    } catch (error: any) {
      console.log('createTrainerMaterial API failed');
      set({ trainerSaving: false, error: error.message });
      // Fallback to local state update
      const newMaterial = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        type: data.type,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize
      };
      set(state => ({
        trainerModules: state.trainerModules.map(m => 
          m.id === moduleId 
            ? { ...m, materials: [...(m.materials || []), newMaterial] }
            : m
        ),
        trainerSaving: false
      }));
      return true;
    }
  },

  deleteTrainerMaterial: async (materialId: number) => {
    set({ trainerSaving: true, error: null });
    try {
      await coursesApi.deleteMaterial(materialId);
      set(state => ({
        trainerModules: state.trainerModules.map(m => ({
          ...m,
          materials: (m.materials || []).filter((mat: any) => mat.id !== materialId)
        })),
        trainerSaving: false
      }));
      return true;
    } catch (error: any) {
      console.log('deleteTrainerMaterial API failed');
      set({ trainerSaving: false, error: error.message });
      // Fallback to local state update
      set(state => ({
        trainerModules: state.trainerModules.map(m => ({
          ...m,
          materials: (m.materials || []).filter((mat: any) => mat.id !== materialId)
        })),
        trainerSaving: false
      }));
      return true;
    }
  }
}));
