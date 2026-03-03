import { Course } from './mockCourses';

// Notification types
export interface Notification {
  id: number;
  type: 'URGENT' | 'FEEDBACK' | 'INFO';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'inbox' | 'sent' | 'draft'; // Thêm category
  sender?: string; // Người gửi (cho inbox)
  recipients?: string[]; // Người nhận (cho sent)
}

// Schedule types
export interface ScheduleClass {
  id: number;
  courseCode: string;
  courseName: string;
  className: string;
  slot: number; // Slot 1-6
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  room: string;
  startTime: string; // For display
  endTime: string; // For display
}

// Time slots mapping
export const TIME_SLOTS = {
  1: { start: '07:00', end: '09:00', label: 'Slot 1 (07:00 - 09:00)' },
  2: { start: '09:00', end: '11:00', label: 'Slot 2 (09:00 - 11:00)' },
  3: { start: '13:00', end: '15:00', label: 'Slot 3 (13:00 - 15:00)' },
  4: { start: '15:00', end: '17:00', label: 'Slot 4 (15:00 - 17:00)' },
  5: { start: '17:00', end: '19:00', label: 'Slot 5 (17:00 - 19:00)' },
  6: { start: '19:00', end: '21:00', label: 'Slot 6 (19:00 - 21:00)' }
};

// Attendance types
export interface Student {
  id: number;
  name: string;
  dateOfBirth: string;
  email: string;
  avatar?: string;
}

export interface AttendanceRecord {
  studentId: number;
  status: 'PRESENT' | 'ABSENT';
  note?: string;
}

export interface ClassSession {
  id: number;
  courseCode: string;
  className: string;
  date: string;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

// Feedback types
export interface StudentFeedback {
  id: number;
  studentName: string;
  studentAvatar?: string;
  courseCode: string;
  rating: number;
  category: 'Tất cả' | 'Ẩn danh' | 'Công khai' | 'Tích cực' | 'Cần cải thiện' | 'Góp ý';
  comment: string;
  date: string;
  isAnonymous: boolean;
  isRead: boolean;
  reply?: string;
}

// Course Module types
export interface Material {
  id: number;
  name: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'LINK';
  size?: string;
  uploadDate: string;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  order: number;
  materials: Material[];
  deadline?: string;
}

export interface CourseDetail extends Course {
  modules: Module[];
}

// Mock Notifications
export const mockNotifications: Notification[] = [
  // INBOX - Thông báo nhận được
  {
    id: 1,
    type: 'URGENT',
    title: 'Báo trì hệ thống khẩn cấp',
    message: 'Hệ thống sẽ bảo trì từ 23:00 - 01:00 đêm nay. Vui lòng lưu dữ liệu và đăng xuất trước thời gian này.',
    time: '10 phút trước',
    isRead: false,
    priority: 'HIGH',
    category: 'inbox',
    sender: 'Hệ thống'
  },
  {
    id: 2,
    type: 'FEEDBACK',
    title: 'Feedback mới từ học viên',
    message: 'Bạn có 3 feedback mới từ học viên khóa Python K22A. Học viên đánh giá tích cực về phương pháp giảng dạy.',
    time: '30 phút trước',
    isRead: false,
    priority: 'MEDIUM',
    category: 'inbox',
    sender: 'Hệ thống'
  },
  {
    id: 3,
    type: 'INFO',
    title: 'Thông báo lịch học mới',
    message: 'Lịch học tuần sau đã được cập nhật. Vui lòng kiểm tra và xác nhận.',
    time: '2 giờ trước',
    isRead: true,
    priority: 'LOW',
    category: 'inbox',
    sender: 'Phòng Đào tạo'
  },
  {
    id: 4,
    type: 'INFO',
    title: 'Yêu cầu cập nhật tài liệu',
    message: 'Vui lòng cập nhật tài liệu giảng dạy cho module 2 trước ngày 15/03.',
    time: '1 ngày trước',
    isRead: true,
    priority: 'MEDIUM',
    category: 'inbox',
    sender: 'HR Department'
  },

  // SENT - Thông báo đã gửi
  {
    id: 5,
    type: 'INFO',
    title: 'Nhắc nhở nộp bài tập',
    message: 'Kính gửi các học viên, vui lòng nộp bài tập Module 1 trước ngày 10/03. Trân trọng.',
    time: '3 giờ trước',
    isRead: true,
    priority: 'MEDIUM',
    category: 'sent',
    recipients: ['ITM5001-M01', 'ITM5002-M02']
  },
  {
    id: 6,
    type: 'INFO',
    title: 'Thông báo nghỉ học',
    message: 'Lớp ITM5001-M01 sẽ nghỉ học vào thứ 5 tuần này do trainer có việc đột xuất.',
    time: '1 ngày trước',
    isRead: true,
    priority: 'HIGH',
    category: 'sent',
    recipients: ['ITM5001-M01']
  },
  {
    id: 7,
    type: 'INFO',
    title: 'Tài liệu mới đã cập nhật',
    message: 'Tài liệu Module 3 đã được cập nhật. Các em vui lòng tải về và học tập.',
    time: '2 ngày trước',
    isRead: true,
    priority: 'LOW',
    category: 'sent',
    recipients: ['ITM5001-M01', 'ITM5002-M02', 'ITM5003-M03']
  },

  // DRAFT - Bản nháp chưa gửi
  {
    id: 8,
    type: 'INFO',
    title: 'Thông báo kiểm tra giữa kỳ',
    message: 'Kính gửi các học viên,\n\nThông báo lịch kiểm tra giữa kỳ:\n- Thời gian: [Chưa xác định]\n- Hình thức: [Chưa xác định]\n\nTrân trọng.',
    time: '5 giờ trước',
    isRead: false,
    priority: 'MEDIUM',
    category: 'draft'
  },
  {
    id: 9,
    type: 'INFO',
    title: 'Khảo sát chất lượng giảng dạy',
    message: 'Nội dung đang soạn thảo...',
    time: '1 ngày trước',
    isRead: false,
    priority: 'LOW',
    category: 'draft'
  }
];

// Mock Schedule
export const mockSchedule: ScheduleClass[] = [
  {
    id: 1,
    courseCode: 'ITM5001-M01',
    courseName: 'Introduction to Information Security',
    className: 'Phòng ban 1',
    slot: 1, // Slot 1 (07:00-09:00)
    startTime: '07:00',
    endTime: '09:00',
    dayOfWeek: 1, // Monday
    room: 'Room 101'
  },
  {
    id: 2,
    courseCode: 'ITM5001-M01',
    courseName: 'Introduction to Information Security',
    className: 'Phòng ban 1',
    slot: 1, // Slot 1 (07:00-09:00)
    startTime: '07:00',
    endTime: '09:00',
    dayOfWeek: 4, // Thursday
    room: 'Room 101'
  },
  {
    id: 3,
    courseCode: 'ITM5001-M01',
    courseName: 'Introduction to Information Security',
    className: 'Phòng ban 1',
    slot: 3, // Slot 3 (13:00-15:00)
    startTime: '13:00',
    endTime: '15:00',
    dayOfWeek: 2, // Tuesday
    room: 'Room 102'
  },
  {
    id: 4,
    courseCode: 'ITM5001-M01',
    courseName: 'Introduction to Information Security',
    className: 'Phòng ban 1',
    slot: 3, // Slot 3 (13:00-15:00)
    startTime: '13:00',
    endTime: '15:00',
    dayOfWeek: 5, // Friday
    room: 'Room 102'
  },
  {
    id: 5,
    courseCode: 'ITM5002-M02',
    courseName: 'Workplace Ethics & Compliance',
    className: 'Phòng ban 2',
    slot: 2, // Slot 2 (09:00-11:00)
    startTime: '09:00',
    endTime: '11:00',
    dayOfWeek: 2, // Tuesday
    room: 'Room 201'
  },
  {
    id: 6,
    courseCode: 'ITM5002-M02',
    courseName: 'Workplace Ethics & Compliance',
    className: 'Phòng ban 2',
    slot: 5, // Slot 5 (17:00-19:00)
    startTime: '17:00',
    endTime: '19:00',
    dayOfWeek: 3, // Wednesday
    room: 'Room 203'
  }
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 1,
    name: 'Nguyen Van A',
    dateOfBirth: '12/12/2002',
    email: 'abc@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff'
  },
  {
    id: 2,
    name: 'Nguyen Van B',
    dateOfBirth: '12/12/2002',
    email: 'bcd@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+B&background=10b981&color=fff'
  },
  {
    id: 3,
    name: 'Tran Thi C',
    dateOfBirth: '15/03/2001',
    email: 'ttc@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+C&background=f59e0b&color=fff'
  }
];

// Mock Class Sessions
export const mockClassSessions: ClassSession[] = [
  {
    id: 1,
    courseCode: 'SE15D09',
    className: 'SE15D09',
    date: '2026-03-02',
    students: mockStudents,
    attendanceRecords: [
      { studentId: 1, status: 'PRESENT' },
      { studentId: 2, status: 'PRESENT' },
      { studentId: 3, status: 'ABSENT', note: 'Sick leave' }
    ]
  }
];

// Mock Feedbacks
export const mockFeedbacks: StudentFeedback[] = [
  {
    id: 1,
    studentName: 'Học viên (Ẩn Danh)',
    courseCode: 'ITM5001-M01',
    rating: 5,
    category: 'Ẩn danh',
    comment: 'Thầy dạy rất nhiệt tình và dễ hiểu. Cách giảng bài của thầy giúp em nắm bắt kiến thức nhanh hơn rất nhiều. Em rất thích phong cách giảng dạy của thầy!',
    date: '10/22/2024',
    isAnonymous: true,
    isRead: false
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    studentAvatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=3b82f6&color=fff',
    courseCode: 'ITM5002-M02',
    rating: 4,
    category: 'Công khai',
    comment: 'Em thấy bài giảng bài rất nhanh, đôi khi em chưa kịp hiểu phần trước thì thầy đã chuyển sang phần sau rồi à. Em mong thầy có thể điều chỉnh tốc độ cho phù hợp hơn.',
    date: '10/22/2024',
    isAnonymous: false,
    isRead: false
  },
  {
    id: 3,
    studentName: 'Nguyễn Văn C',
    studentAvatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+C&background=10b981&color=fff',
    courseCode: 'ITM5001-M01',
    rating: 5,
    category: 'Tích cực',
    comment: 'Khóa học rất bổ ích và thực tế. Cảm ơn thầy!',
    date: '10/20/2024',
    isAnonymous: false,
    isRead: true,
    reply: 'Cảm ơn em đã đóng góp ý kiến. Thầy sẽ cải thiện!'
  }
];

// Mock Course Modules
export const mockCourseModules: Module[] = [
  {
    id: 1,
    name: 'Module 1: Giới thiệu Python',
    description: 'Học về cú pháp cơ bản, biến, kiểu dữ liệu',
    order: 1,
    deadline: '15/01/2025',
    materials: [
      {
        id: 1,
        name: 'Bài 1 - Giới thiệu Python.pdf',
        type: 'PDF',
        size: '2.5 MB',
        uploadDate: '15/01/2025'
      },
      {
        id: 2,
        name: 'Video hướng dẫn cài đặt',
        type: 'VIDEO',
        uploadDate: '15/01/2025'
      }
    ]
  },
  {
    id: 2,
    name: 'Module 2: Biến và Kiểu dữ liệu',
    description: 'Tìm hiểu về các kiểu dữ liệu trong Python',
    order: 2,
    materials: []
  }
];

export const getTrainerCourses = () => {
  // This would filter courses by trainer in real app
  return mockCourseModules;
};
