import api from '../lib/axios';

export interface CourseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  durationHours?: number;
  category?: string;
  level?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaterialDto {
  id: number;
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  fileSize?: number;
  displayOrder?: number;
  createdAt?: string;
}

export interface ModuleDto {
  id: number;
  title: string;
  description?: string;
  displayOrder?: number;
  materials: MaterialDto[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getTrainerCourses = async (): Promise<CourseDto[]> => {
  const res = await api.get<ApiResponse<CourseDto[]>>('/courses/my/trainer');
  return res.data.data;
};

export const getCourseModules = async (courseId: number): Promise<ModuleDto[]> => {
  const res = await api.get<ApiResponse<ModuleDto[]>>(`/courses/${courseId}/modules`);
  return res.data.data;
};

export const createModule = async (
  courseId: number,
  title: string,
  description: string,
  displayOrder: number
): Promise<ModuleDto> => {
  const res = await api.post<ApiResponse<ModuleDto>>(`/courses/${courseId}/modules`, {
    title,
    description,
    displayOrder: String(displayOrder),
  });
  return res.data.data;
};

export const deleteModule = async (moduleId: number): Promise<void> => {
  await api.delete(`/courses/modules/${moduleId}`);
};

export const deleteMaterial = async (materialId: number): Promise<void> => {
  await api.delete(`/courses/materials/${materialId}`);
};

export const uploadMaterial = async (
  moduleId: number,
  file: File,
  title?: string,
  description?: string,
  displayOrder?: number
): Promise<MaterialDto> => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (displayOrder !== undefined) formData.append('displayOrder', String(displayOrder));

  const res = await api.post<ApiResponse<MaterialDto>>(
    `/courses/modules/${moduleId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data.data;
};
