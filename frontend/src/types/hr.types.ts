export type HRDashboardStats = {
  totalCourses: number;
  totalSchedules: number;
  totalNotifications: number;
  totalTrainers: number;
};

export type Employee = {
  id: number;
  userId: string;
  fullname: string;
  email: string;
  role: 'HR' | 'Trainer' | 'Employee' | 'Admin' | string;
  status: 'Active' | 'Inactive';
};

export type HRClassroom = {
  id: number;
  classCode: string;
  className: string;
};

export type HRSchedule = {
  id: number | string;
  trainerUsername: string;
  courseCode: string;
  courseName: string;
  classCode?: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  locationType?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  meetingLink?: string;
  status?: string;
};

export type NotificationChannel = 'In-app' | 'Email';
export type NotificationStatus = 'Draft' | 'Scheduled' | 'Sent' | 'Cancelled';

export type HrNotification = {
  id: number;
  title: string;
  content?: string;
  channel: NotificationChannel;
  sentTo: string;
  scheduledAt?: string;
  sentAt?: string;
  creator: string;
  status: NotificationStatus;
};
