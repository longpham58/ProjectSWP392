import api from '../lib/axios';

export interface TrainerScheduleDto {
  sessionId: number;
  sessionName?: string;
  sessionNumber: number;
  date: string;
  timeStart: string;
  timeEnd: string;
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

export const getTrainerSchedule = async (): Promise<TrainerScheduleDto[]> => {
  const response = await api.get<ApiResponse<TrainerScheduleDto[]>>('/trainer/schedule');
  return response.data.data;
};

export const getTrainerScheduleByDateRange = async (
  startDate: string,
  endDate: string
): Promise<TrainerScheduleDto[]> => {
  const response = await api.get<ApiResponse<TrainerScheduleDto[]>>('/trainer/schedule', {
    params: { startDate, endDate }
  });
  return response.data.data;
};
