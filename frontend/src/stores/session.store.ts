import { create } from "zustand";
import { sessionApi, CourseSchedule } from "../api/session.api";

interface SessionState {
  schedule: CourseSchedule[];
  scheduleLoading: boolean;
  scheduleError: string | null;

  fetchCourseSchedule: () => Promise<void>;
  fetchCourseScheduleByCourse: (courseId: number) => Promise<void>;
  clearSchedule: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  schedule: [],
  scheduleLoading: false,
  scheduleError: null,

  fetchCourseSchedule: async () => {
    set({ scheduleLoading: true, scheduleError: null });
    try {
      const res = await sessionApi.getCourseSchedule();
      if (res.data.data) {
        set({ schedule: res.data.data, scheduleLoading: false });
      } else {
        set({ schedule: [], scheduleLoading: false });
      }
    } catch (error: any) {
      console.log('fetchCourseSchedule API failed:', error.message);
      set({ schedule: [], scheduleLoading: false, scheduleError: error.message });
    }
  },

  fetchCourseScheduleByCourse: async (courseId: number) => {
    set({ scheduleLoading: true, scheduleError: null });
    try {
      const res = await sessionApi.getCourseScheduleByCourse(courseId);
      if (res.data.data) {
        set({ schedule: res.data.data, scheduleLoading: false });
      } else {
        set({ schedule: [], scheduleLoading: false });
      }
    } catch (error: any) {
      console.log('fetchCourseScheduleByCourse API failed for courseId:', courseId, '-', error.message);
      set({ schedule: [], scheduleLoading: false, scheduleError: error.message });
    }
  },

  clearSchedule: () => {
    set({ schedule: [], scheduleError: null });
  },
}));
