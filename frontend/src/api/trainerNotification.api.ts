import axios from '../lib/axios';

export interface TrainerNotificationDto {
  id: number;
  title: string;
  message: string;
  sentDate: string;
  isRead: boolean;
  type: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  category: 'inbox' | 'sent' | 'draft';
  sender?: string;
  recipients?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TrainerNotificationRequest {
  title: string;
  message: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  recipientType: 'STUDENTS' | 'HR';
  classCodes?: string[];
  isDraft: boolean;
}

export const trainerNotificationApi = {
  // Get notifications by category
  getNotifications: async (category: 'inbox' | 'sent' | 'draft' = 'inbox') => {
    const response = await axios.get('/trainer/notifications', {
      params: { category }
    });
    return response.data;
  },

  // Get trainer's courses for class selection
  getTrainerCourses: async () => {
    const response = await axios.get('/trainer/notifications/available-courses');
    return response.data;
  },

  // Create notification (draft or send)
  createNotification: async (data: TrainerNotificationRequest) => {
    const response = await axios.post('/trainer/notifications', data);
    return response.data;
  },

  // Update draft notification
  updateNotification: async (id: number, data: TrainerNotificationRequest) => {
    const response = await axios.put(`/trainer/notifications/${id}`, data);
    return response.data;
  },

  // Send notification (convert draft to sent)
  sendNotification: async (id: number) => {
    const response = await axios.post(`/trainer/notifications/${id}/send`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: number) => {
    const response = await axios.delete(`/trainer/notifications/${id}`);
    return response.data;
  },

  // Mark as read (for inbox)
  markAsRead: async (id: number) => {
    const response = await axios.put(`/trainer/notifications/${id}/read`);
    return response.data;
  }
};
