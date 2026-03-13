import axios from '../lib/axios';
import { ResponseDto } from '../types/common.types';

export interface TrainerScheduleDto {
  id: number;
  sessionNumber: number;
  date: string; // LocalDate as string
  timeStart: string; // LocalTime as string
  timeEnd: string; // LocalTime as string
  location: string;
  locationType: 'ONLINE' | 'OFFLINE';
  meetingLink?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  
  // Course info
  courseId: number;
  courseCode: string;
  courseName: string;
  
  // Capacity
  maxCapacity: number;
  currentEnrolled: number;
  
  // Computed fields for frontend
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  slot: number; // 1-11
}

export interface CreateSessionRequest {
  courseId: number;
  date: string; // YYYY-MM-DD format
  timeStart: string; // HH:mm format
  timeEnd: string; // HH:mm format
  location: string;
  locationType: 'ONLINE' | 'OFFLINE';
  meetingLink?: string;
  meetingPassword?: string;
  maxCapacity: number;
  status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface UpdateSessionRequest {
  date: string; // YYYY-MM-DD format
  timeStart: string; // HH:mm format
  timeEnd: string; // HH:mm format
  location: string;
  locationType: 'ONLINE' | 'OFFLINE';
  meetingLink?: string;
  meetingPassword?: string;
  maxCapacity: number;
  status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  cancellationReason?: string;
}

export interface CourseOption {
  id: number;
  code: string;
  name: string;
  status: string;
}

export const trainerScheduleApi = {
  /**
   * Get all sessions for the logged-in trainer
   */
  getTrainerSchedule: async (): Promise<TrainerScheduleDto[]> => {
    const response = await axios.get<ResponseDto<TrainerScheduleDto[]>>('/trainer/schedule');
    return response.data.data;
  },

  /**
   * Get session details by ID
   */
  getSessionById: async (id: number): Promise<TrainerScheduleDto> => {
    const response = await axios.get<ResponseDto<TrainerScheduleDto>>(`/trainer/schedule/${id}`);
    return response.data.data;
  },

  /**
   * Get trainer's courses for dropdown
   */
  getTrainerCourses: async (): Promise<CourseOption[]> => {
    const response = await axios.get<ResponseDto<CourseOption[]>>('/trainer/schedule/courses');
    return response.data.data;
  }
};