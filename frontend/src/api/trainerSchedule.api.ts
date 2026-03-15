import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface TrainerScheduleDto {
  sessionId: number;
  sessionName?: string;
  sessionNumber: number;
  date: string; // LocalDate as ISO string
  timeStart: string; // LocalTime as string
  timeEnd: string; // LocalTime as string
  location: string;
  locationType: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  classCode: string;
  trainerName: string;
  maxCapacity: number;
  currentEnrolled: number;
  dayOfWeek?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get trainer's schedule
 */
export const getTrainerSchedule = async (): Promise<TrainerScheduleDto[]> => {
  const response = await axios.get<ApiResponse<TrainerScheduleDto[]>>(
    `${API_BASE_URL}/trainer/schedule`
  );
  return response.data.data;
};

/**
 * Get trainer's schedule for a specific date range
 */
export const getTrainerScheduleByDateRange = async (
  startDate: string,
  endDate: string
): Promise<TrainerScheduleDto[]> => {
  const response = await axios.get<ApiResponse<TrainerScheduleDto[]>>(
    `${API_BASE_URL}/trainer/schedule`,
    {
      params: { startDate, endDate }
    }
  );
  return response.data.data;
};
