import api from '../lib/axios';

// Matches backend TrainerScheduleDto exactly
export type TrainerScheduleDto = {
  sessionId: number;
  sessionNumber: number;
  date: string;        // "YYYY-MM-DD"
  timeStart: string;   // "HH:mm:ss"
  timeEnd: string;     // "HH:mm:ss"
  location: string;
  locationType: string;
  status: string;
  meetingLink?: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  classCode: string;
  trainerName: string;
  maxCapacity: number;
  currentEnrolled: number;
  dayOfWeek?: number;
};

// Alias
export type TrainerSchedule = TrainerScheduleDto;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getTrainerSchedule = async (): Promise<TrainerScheduleDto[]> => {
  const response = await api.get<ApiResponse<TrainerScheduleDto[]>>('trainer/schedule');
  return response.data.data;
};
