import { create } from "zustand";
import { moduleProgressApi, ModuleProgressDto } from "../api/moduleProgress.api";
import { useAuthStore } from "./auth.store";
import { mockUserModuleProgress } from "../mocks/quiz.mock";

/**
 * Get current user ID from auth store
 */
const getCurrentUserId = (): number => {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.id;
};

interface ModuleProgressState {
  moduleProgress: ModuleProgressDto[];
  loading: boolean;
  error: string | null;

  fetchModuleProgress: (userId: number, courseId: number) => Promise<void>;
  completeModule: (userId: number, moduleId: number) => Promise<void>;
  updateProgress: (userId: number, moduleId: number, percentage: number) => Promise<void>;
}

export const useModuleProgressStore = create<ModuleProgressState>((set, get) => ({
  moduleProgress: [],
  loading: false,
  error: null,

  fetchModuleProgress: async (userId: number, courseId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await moduleProgressApi.getModuleProgress(userId, courseId);
      // If API returns data, use it; otherwise fallback to mock data
      if (res.data.data && res.data.data.length > 0) {
        set({ moduleProgress: res.data.data, loading: false });
      } else {
        console.log('No progress data from API for user:', userId, 'course:', courseId, '- using mock data');
        // Filter mock data by courseId
        const mockProgress = mockUserModuleProgress.filter(p => p.courseId === courseId && p.userId === userId) as ModuleProgressDto[];
        set({ moduleProgress: mockProgress, loading: false });
      }
    } catch (error: any) {
      console.log('fetchModuleProgress API failed for user:', userId, 'course:', courseId, '- using mock data');
      // Filter mock data by courseId on API failure
      const mockProgress = mockUserModuleProgress.filter(p => p.courseId === courseId && p.userId === userId) as ModuleProgressDto[];
      set({ moduleProgress: mockProgress, loading: false, error: error.message });
    }
  },

  completeModule: async (userId: number, moduleId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await moduleProgressApi.completeModule(userId, moduleId);
      
      const currentProgress = get().moduleProgress;
      const existingIndex = currentProgress.findIndex(p => p.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        const updated = [...currentProgress];
        updated[existingIndex] = res.data.data;
        set({ moduleProgress: updated, loading: false });
      } else {
        set({ moduleProgress: [...currentProgress, res.data.data], loading: false });
      }
    } catch (error: any) {
      console.log('completeModule API failed for module:', moduleId, '- using local state');
      // Optimistically update local state even if API fails
      const currentProgress = get().moduleProgress;
      const existingIndex = currentProgress.findIndex(p => p.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        const updated = [...currentProgress];
        updated[existingIndex] = { ...updated[existingIndex], isCompleted: true };
        set({ moduleProgress: updated, loading: false });
      } else {
        set({ 
          moduleProgress: [...currentProgress, { 
            id: 0,
            userId, 
            moduleId, 
            moduleTitle: '',
            courseId: 0,
            courseName: '',
            enrollmentId: null,
            progressPercentage: 100, 
            isCompleted: true, 
            completedAt: new Date().toISOString(),
            timeSpentMinutes: 0,
            lastAccessedAt: null,
            createdAt: new Date().toISOString()
          }] as ModuleProgressDto[], 
          loading: false 
        });
      }
    }
  },

  updateProgress: async (userId: number, moduleId: number, percentage: number) => {
    set({ loading: true, error: null });
    try {
      const res = await moduleProgressApi.updateProgress(userId, moduleId, percentage);
      
      const currentProgress = get().moduleProgress;
      const existingIndex = currentProgress.findIndex(p => p.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        const updated = [...currentProgress];
        updated[existingIndex] = res.data.data;
        set({ moduleProgress: updated, loading: false });
      } else {
        set({ moduleProgress: [...currentProgress, res.data.data], loading: false });
      }
    } catch (error: any) {
      console.log('updateProgress API failed for module:', moduleId, '- using local state');
      // Optimistically update local state
      const currentProgress = get().moduleProgress;
      const existingIndex = currentProgress.findIndex(p => p.moduleId === moduleId);
      
      if (existingIndex >= 0) {
        const updated = [...currentProgress];
        updated[existingIndex] = { ...updated[existingIndex], progressPercentage: percentage };
        set({ moduleProgress: updated, loading: false });
      } else {
        set({ 
          moduleProgress: [...currentProgress, { 
            id: 0,
            userId, 
            moduleId, 
            moduleTitle: '',
            courseId: 0,
            courseName: '',
            enrollmentId: null,
            progressPercentage: percentage, 
            isCompleted: percentage >= 100, 
            completedAt: percentage >= 100 ? new Date().toISOString() : null,
            timeSpentMinutes: 0,
            lastAccessedAt: null,
            createdAt: new Date().toISOString()
          }] as ModuleProgressDto[], 
          loading: false 
        });
      }
    }
  },
}));


