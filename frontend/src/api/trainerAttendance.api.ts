import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface SessionAttendanceDto {
  sessionId: number;
  studentName: string;
  studentId: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  status: string;
  attended: boolean;
  completionStatus: string;
  markedBy?: string;
  notes?: string;
}

export interface AttendanceUpdateRequest {
  studentId: number;
  attended: boolean;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get attendance for a specific session
 */
export const getSessionAttendance = async (sessionId: number): Promise<SessionAttendanceDto[]> => {
  const response = await axios.get<ApiResponse<SessionAttendanceDto[]>>(
    `${API_BASE_URL}/trainer/attendance/session/${sessionId}`
  );
  return response.data.data;
};

/**
 * Update attendance for students in a session
 */
export const updateSessionAttendance = async (
  sessionId: number,
  attendanceUpdates: AttendanceUpdateRequest[]
): Promise<void> => {
  await axios.post<ApiResponse<string>>(
    `${API_BASE_URL}/trainer/attendance/session/${sessionId}`,
    attendanceUpdates
  );
};

// Export as trainerAttendanceApi object for easier importing
export const trainerAttendanceApi = {
  getSessionAttendance,
  updateSessionAttendance
};