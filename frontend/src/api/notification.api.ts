import axios from "axios";

const API_URL = "/notifications";

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";

  referenceType?: string | null;
  referenceId?: number | null;

  detail_content?: string;
  detailContent?: string;
  relatedCourse?: string;
  actionUrl?: string;
}


export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const notificationApi = {

  // Get current user's notifications
  async getMyNotifications(): Promise<Notification[]> {
    const res = await axios.get<ApiResponse<Notification[]>>(
      `${API_URL}/my`
    );

    return res.data.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number) {
    await axios.put(`${API_URL}/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead() {
    await axios.put(`${API_URL}/read-all`);
  },

  // Delete notification
  async deleteNotification(notificationId: number) {
    await axios.delete(`${API_URL}/${notificationId}`);
  },

  // Get single notification by ID
  async getNotificationById(notificationId: number): Promise<Notification> {
    const res = await axios.get<ApiResponse<Notification>>(
      `${API_URL}/${notificationId}`
    );
    return res.data.data;
  },

}

;