import api from '../lib/axios';

const BASE_URL = '/hr';

// Types matching backend HrNotificationDto
export type NotificationDto = {
  id: number;
  title: string;
  content?: string;
  channel: string;
  sentTo: string;
  scheduledAt?: string;
  sentAt?: string;
  creator: string;
  status: string; // Draft | Sent | Scheduled | Cancelled
  // extra fields from NotificationService.convertToDto (used in inbox)
  message?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
  isDraft?: boolean;
  sentDate?: string;
  createdAt?: string;
  category?: string;
  sender?: string;
  recipients?: string[];
  recipientType?: string;
  classCodes?: string;
};

export type NotificationRequest = {
  title: string;
  message?: string;
  content?: string;
  type?: string;
  priority?: string;
  recipientType?: string;
  classCodes?: string[];
  trainerIds?: string[];
  isDraft?: boolean;
  // legacy fields
  channel?: string;
  sentTo?: string;
  scheduledAt?: string;
  sentAt?: string;
  creator?: string;
  status?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getHrNotifications(category = 'inbox'): Promise<NotificationDto[]> {
  const response = await api.get<ApiResponse<NotificationDto[]>>(`${BASE_URL}/notifications`, {
    params: { category }
  });
  return response.data.data;
}

export async function createHrNotification(notification: NotificationRequest): Promise<void> {
  await api.post(`${BASE_URL}/notifications`, notification);
}

export async function updateHrNotification(id: number, notification: NotificationRequest): Promise<void> {
  await api.put(`${BASE_URL}/notifications/${id}`, notification);
}

export async function deleteHrNotification(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/notifications/${id}`);
}

export async function markHrNotificationAsRead(id: number): Promise<void> {
  await api.put(`${BASE_URL}/notifications/${id}/read`);
}

export async function sendHrNotification(id: number): Promise<void> {
  await api.post(`${BASE_URL}/notifications/${id}/send`);
}

export async function getHrClasses(): Promise<Array<{ code: string; name: string }>> {
  const response = await api.get<ApiResponse<Array<any>>>(`${BASE_URL}/classes`);
  return (response.data.data || []).map(c => ({ code: c.classCode, name: c.className }));
}

export async function getHrTrainers(): Promise<Array<{ id: string; fullName: string; username: string }>> {
  const response = await api.get<ApiResponse<Array<any>>>(`${BASE_URL}/classes/trainers`);
  return (response.data.data || []).map(t => ({ id: t.trainerId.toString(), fullName: t.trainerName, username: t.trainerName }));
}