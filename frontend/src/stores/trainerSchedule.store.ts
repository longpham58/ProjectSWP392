import { create } from 'zustand';
import { 
  TrainerScheduleDto, 
  CourseOption,
  trainerScheduleApi 
} from '../api/trainerSchedule.api';

interface TrainerScheduleState {
  // State
  schedule: TrainerScheduleDto[];
  selectedSession: TrainerScheduleDto | null;
  courses: CourseOption[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchSchedule: () => Promise<void>;
  fetchSessionById: (id: number) => Promise<void>;
  fetchCourses: () => Promise<void>;
  clearError: () => void;
  setSelectedSession: (session: TrainerScheduleDto | null) => void;
}

export const useTrainerScheduleStore = create<TrainerScheduleState>((set, get) => ({
  // Initial state
  schedule: [],
  selectedSession: null,
  courses: [],
  loading: false,
  error: null,

  // Actions
  fetchSchedule: async () => {
    set({ loading: true, error: null });
    try {
      const schedule = await trainerScheduleApi.getTrainerSchedule();
      set({ schedule, loading: false });
    } catch (error: any) {
      console.error('Error fetching trainer schedule:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch schedule',
        loading: false 
      });
    }
  },

  fetchSessionById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const session = await trainerScheduleApi.getSessionById(id);
      set({ selectedSession: session, loading: false });
    } catch (error: any) {
      console.error('Error fetching session:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch session',
        loading: false 
      });
    }
  },

  fetchCourses: async () => {
    try {
      const courses = await trainerScheduleApi.getTrainerCourses();
      set({ courses });
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch courses'
      });
    }
  },

  clearError: () => set({ error: null }),

  setSelectedSession: (session: TrainerScheduleDto | null) => {
    set({ selectedSession: session });
  }
}));