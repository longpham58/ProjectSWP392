import api from '../lib/axios';

export interface StudentAttendanceDto {
  userId: number;
  fullName: string;
  email: string;
  attended: boolean | null;
  notes?: string;
}

export interface ClassAttendanceDto {
  classCode: string;
  className: string;
  date: string;
  students: StudentAttendanceDto[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get classes that have schedule today
export const getTodayClasses = async (): Promise<ClassAttendanceDto[]> => {
  const response = await api.get<ApiResponse<ClassAttendanceDto[]>>(
    'trainer/attendance/today-classes'
  );
  return response.data.data;
};

export const getClassAttendance = async (
  classCode: string,
  date: string
): Promise<ClassAttendanceDto> => {
  const response = await api.get<ApiResponse<ClassAttendanceDto>>(
    `trainer/attendance/class/${classCode}`,
    { params: { date } }
  );
  return response.data.data;
};

export const saveClassAttendance = async (
  classCode: string,
  date: string,
  updates: StudentAttendanceDto[]
): Promise<void> => {
  await api.post(`trainer/attendance/class/${classCode}`, { students: updates }, {
    params: { date }
  });
};
