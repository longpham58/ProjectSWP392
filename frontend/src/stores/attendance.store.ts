import { create } from "zustand";
import { attendanceApi, SessionAttendance, AttendanceSummary } from "../api/attendance.api";
import { getMockSessionAttendance, getMockAttendanceSummary } from "../mocks/attendance.mock";

interface AttendanceState {
  sessions: SessionAttendance[];
  summary: AttendanceSummary | null;
  loading: boolean;
  error: string | null;

  fetchSessionAttendance: (courseId: number, userId: number) => Promise<void>;
  fetchAttendanceSummary: (courseId: number, userId: number) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  sessions: [],
  summary: null,
  loading: false,
  error: null,

  fetchSessionAttendance: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await attendanceApi.getSessionAttendance(courseId);
      // Use API data if available, otherwise use mock data
      if (res.data.data && res.data.data.length > 0) {
        set({ sessions: res.data.data, loading: false });
      } else {
        // Fallback to mock data
        console.log('API returned empty, using mock data for session attendance');
        set({ sessions: getMockSessionAttendance(courseId), loading: false });
      }
    } catch (error: any) {
      console.log('fetchSessionAttendance API failed for courseId:', courseId, '- using mock data');
      set({ sessions: getMockSessionAttendance(courseId), loading: false, error: error.message });
    }
  },

  fetchAttendanceSummary: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await attendanceApi.getAttendanceSummary(courseId);
      // Use API data if available, otherwise use mock data
      if (res.data.data) {
        set({ summary: res.data.data, loading: false });
      } else {
        // Fallback to mock data
        console.log('API returned empty, using mock data for attendance summary');
        set({ summary: getMockAttendanceSummary(courseId), loading: false });
      }
    } catch (error: any) {
      console.log('fetchAttendanceSummary API failed for courseId:', courseId, '- using mock data');
      set({ summary: getMockAttendanceSummary(courseId), loading: false, error: error.message });
    }
  },
}));
