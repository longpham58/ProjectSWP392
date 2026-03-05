export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Khóa học mới được thêm",
    message: "Khóa học 'Leadership Development' đã được thêm vào hệ thống",
    date: "2026-03-04",
    read: false,
    type: "info"
  },
  {
    id: 2,
    title: "Deadline sắp tới",
    message: "Quiz 2 của khóa 'Spring Boot Microservices' sẽ đến hạn trong 3 ngày",
    date: "2026-03-03",
    read: false,
    type: "warning"
  },
  {
    id: 3,
    title: "Chứng chỉ đã sẵn sàng",
    message: "Chứng chỉ khóa học 'Python Cơ bản' đã sẵn sàng để tải xuống",
    date: "2026-03-02",
    read: false,
    type: "success"
  },
  {
    id: 4,
    title: "Thông báo bảo trì",
    message: "Hệ thống sẽ bảo trì vào 10:00 PM ngày 10/03/2026",
    date: "2026-03-01",
    read: true,
    type: "info"
  },
  {
    id: 5,
    title: "Cập nhật khóa học",
    message: "Khóa học 'Introduction to Information Security' đã được cập nhật nội dung mới",
    date: "2026-02-28",
    read: true,
    type: "info"
  }
];
