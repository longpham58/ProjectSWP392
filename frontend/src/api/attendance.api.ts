import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface SessionAttendance {
  sessionId: number;
  sessionName: string;
  sessionNumber: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  status: string;
  attended: boolean;
  markedComplete: boolean;
  markedBy: string | null;
  completionStatus: string;
  totalSessions: number;
  attendedSessions: number;
  remainingSessions: number;
}

export interface AttendanceSummary {
  totalSessions: number;
  attendedSessions: number;
  remainingSessions: number;
}

export const attendanceApi = {
  // Get all sessions with attendance for a course
  getSessionAttendance: (courseId: number) =>
    axios.get<ApiResponse<SessionAttendance[]>>(`/api/attendance/course/${courseId}`),

  // Get attendance summary for a course
  getAttendanceSummary: (courseId: number) =>
    axios.get<ApiResponse<AttendanceSummary>>(`/api/attendance/course/${courseId}/summary`),
};
