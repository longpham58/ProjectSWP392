import api from '../lib/axios';

const BASE_URL = '/trainer';

// Types
export type NotificationDto = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  isDraft: boolean;
  sentDate: string;
  createdAt: string;
  category: string;
  sender?: string;
  recipients?: string[];
  recipientType?: string;
  classCodes?: string;
};

export type NotificationRequest = {
  title: string;
  message: string;
  type: string;
  priority: string;
  recipientType: string;
  classCodes?: string[];
  isDraft: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// API Functions
export async function getTrainerNotifications(category = 'inbox'): Promise<NotificationDto[]> {
  const response = await api.get<ApiResponse<NotificationDto[]>>(`${BASE_URL}/notifications`, {
    params: { category }
  });
  return response.data.data;
}

export async function createNotification(notification: NotificationRequest): Promise<void> {
  await api.post(`${BASE_URL}/notifications`, notification);
}

export async function updateNotification(id: number, notification: NotificationRequest): Promise<void> {
  await api.put(`${BASE_URL}/notifications/${id}`, notification);
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/notifications/${id}`);
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await api.put(`${BASE_URL}/notifications/${id}/read`);
}

export async function sendNotification(id: number): Promise<void> {
  await api.post(`${BASE_URL}/notifications/${id}/send`);
}

export async function getTrainerClasses(): Promise<Array<{ code: string; name: string }>> {
  const response = await api.get<ApiResponse<Array<{ code: string; name: string }>>>(`${BASE_URL}/courses/simple`);
  return response.data.data;
}
