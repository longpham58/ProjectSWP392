import axios from '../../lib/axios';
import type {
  Employee,
  HRClassroom,
  HRDashboardStats,
  HrNotification,
  HRSchedule,
} from '../../types/hr.types';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export const dashboardService = {
  getStats: () => axios.get<ApiResponse<HRDashboardStats>>('/hr/dashboard/stats'),
};

export const hrEmployeeService = {
  list: (params?: { role?: string; status?: string; keyword?: string }) =>
    axios.get<ApiResponse<Employee[]>>('/hr/employees', { params }),
};

export const hrScheduleService = {
  list: (params?: Record<string, unknown>) =>
    axios.get<ApiResponse<HRSchedule[]>>('/hr/schedules', { params }),
  create: (payload: Omit<HRSchedule, 'id'>) =>
    axios.post<ApiResponse<HRSchedule>>('/hr/schedules', payload),
  update: (id: string | number, payload: Omit<HRSchedule, 'id'>) =>
    axios.put<ApiResponse<HRSchedule>>(`/hr/schedules/${id}`, payload),
  remove: (id: string | number) =>
    axios.delete<ApiResponse<void>>(`/hr/schedules/${id}`),
};

export const hrNotificationService = {
  list: (params?: Record<string, unknown>) =>
    axios.get<ApiResponse<HrNotification[]>>('/hr/notifications', { params }),
  create: (payload: Omit<HrNotification, 'id'>) =>
    axios.post<ApiResponse<HrNotification>>('/hr/notifications', payload),
  update: (id: number, payload: Omit<HrNotification, 'id'>) =>
    axios.put<ApiResponse<HrNotification>>(`/hr/notifications/${id}`, payload),
  remove: (id: number) =>
    axios.delete<ApiResponse<void>>(`/hr/notifications/${id}`),
};

export const hrClassService = {
  list: () => axios.get<ApiResponse<HRClassroom[]>>('/hr/classes'),
  listByCourse: (courseId: number) => axios.get<ApiResponse<HRClassroom[]>>(`/hr/classes?courseId=${courseId}`),
  listTrainers: () => axios.get<ApiResponse<Array<{ trainerId: number; trainerName: string }>>>('/hr/classes/trainers'),
  create: (payload: Omit<HRClassroom, 'id' | 'courseName' | 'courseCode' | 'trainerName'>) =>
    axios.post<ApiResponse<HRClassroom>>('/hr/classes', payload),
  update: (id: number, payload: Omit<HRClassroom, 'id' | 'courseName' | 'courseCode' | 'trainerName'>) =>
    axios.put<ApiResponse<HRClassroom>>(`/hr/classes/${id}`, payload),
  remove: (id: number) => axios.delete<ApiResponse<void>>(`/hr/classes/${id}`),
};

export const hrClassMemberService = {
  getMembers: (classId: number | string) => 
    axios.get<ApiResponse<any[]>>(`/hr/classes/${classId}/members`),
  getAvailableEmployees: (classId: number | string) => 
    axios.get<ApiResponse<any[]>>(`/hr/classes/${classId}/members/available-employees`),
  addMember: (classId: number | string, userId: number | string) => 
    axios.post<ApiResponse<any>>(`/hr/classes/${classId}/members/${userId}`),
  removeMember: (classId: number | string, memberId: number | string) => 
    axios.delete<ApiResponse<void>>(`/hr/classes/${classId}/members/${memberId}`),
  importMembers: (classId: number | string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post<ApiResponse<any>>(`/hr/classes/${classId}/members/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadTemplate: (classId: number | string) => 
    axios.get(`/hr/classes/${classId}/members/template`, { responseType: 'blob' }),
};

