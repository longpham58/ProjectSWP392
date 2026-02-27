// Mock data cho tất cả trang trainer

// Notifications
export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info';
  date: string;
  isRead: boolean;
  sender?: string;
}

// Quiz Question
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

// Quiz
export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'final';
  moduleId?: string;
  duration: number; // minutes
  passingScore: number; // percentage
  questions: QuizQuestion[];
  totalPoints: number;
  createdAt: string;
}

export const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Báo trì hệ thống khẩn cấp',
    content: 'Hệ thống sẽ bảo trì từ 23:00 - 01:00 đêm nay. Vui lòng lưu dữ liệu trước khi đăng xuất.',
    type: 'urgent',
    date: '10 phút trước',
    isRead: false,
    sender: 'System Admin'
  },
  {
    id: '2',
    title: 'Feedback mới từ học viên',
    content: 'Bạn có 5 feedback mới từ lớp học Python K123. Hãy xem và phản hồi.',
    type: 'info',
    date: '30 phút trước',
    isRead: false,
    sender: 'HR Department'
  },
  {
    id: '3',
    title: 'Nhắc nhở: Cập nhật điểm danh',
    content: 'Vui lòng cập nhật điểm danh cho lớp Java nâng cao trước 17:00 hôm nay.',
    type: 'info',
    date: '2 giờ trước',
    isRead: true,
    sender: 'HR Department'
  }
];

// Schedule Events
export interface ScheduleEvent {
  id: string;
  courseCode: string;
  courseName: string;
  room: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
}

export const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: '1',
    courseCode: 'PYTHON-001',
    courseName: 'Python cơ bản',
    room: 'Phòng A1',
    day: 2,
    startTime: '08:00',
    endTime: '10:00',
    color: '#60D5F2'
  },
  {
    id: '2',
    courseCode: 'JAVA-002',
    courseName: 'Java nâng cao',
    room: 'Phòng B2',
    day: 3,
    startTime: '13:00',
    endTime: '15:00',
    color: '#7FE5B8'
  },
  {
    id: '3',
    courseCode: 'WEB-003',
    courseName: 'Web Development',
    room: 'Phòng C3',
    day: 4,
    startTime: '10:00',
    endTime: '12:00',
    color: '#FFB84D'
  },
  {
    id: '4',
    courseCode: 'DATA-004',
    courseName: 'Data Science',
    room: 'Phòng A2',
    day: 5,
    startTime: '14:00',
    endTime: '16:00',
    color: '#FF6B9D'
  }
];

// Students for Attendance
export interface Student {
  id: string;
  name: string;
  dob: string;
  email: string;
  attendance: 'present' | 'absent' | null;
  avatar?: string;
}

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    dob: '12/12/2002',
    email: 'nguyenvana@gmail.com',
    attendance: null
  },
  {
    id: '2',
    name: 'Trần Thị B',
    dob: '15/08/2001',
    email: 'tranthib@gmail.com',
    attendance: null
  },
  {
    id: '3',
    name: 'Lê Văn C',
    dob: '20/03/2002',
    email: 'levanc@gmail.com',
    attendance: null
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    dob: '05/11/2001',
    email: 'phamthid@gmail.com',
    attendance: null
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    dob: '18/06/2002',
    email: 'hoangvane@gmail.com',
    attendance: null
  }
];

// Feedback
export interface FeedbackItem {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  status: 'completed' | 'pending';
  content: string;
  rating: number;
  category: 'positive' | 'negative' | 'suggestion';
}

export const mockFeedbacks: FeedbackItem[] = [
  {
    id: '1',
    studentName: 'Học viên (Ẩn Danh)',
    studentId: 'PYTHON-001',
    date: '10/12/2024',
    status: 'completed',
    content: 'Thầy dạy rất nhiệt tình và dễ hiểu. Cách giảng dạy của thầy giúp em hiểu bài nhanh hơn rất nhiều.',
    rating: 5,
    category: 'positive'
  },
  {
    id: '2',
    studentName: 'Trần Thị B',
    studentId: 'JAVA-002',
    date: '15/12/2024',
    status: 'pending',
    content: 'Em thấy lớp học rất bổ ích. Tuy nhiên, em mong thầy có thể giảng chậm hơn một chút.',
    rating: 4,
    category: 'suggestion'
  },
  {
    id: '3',
    studentName: 'Lê Văn C',
    studentId: 'WEB-003',
    date: '18/12/2024',
    status: 'completed',
    content: 'Khóa học rất hay, thầy nhiệt tình. Em đã học được rất nhiều kiến thức thực tế.',
    rating: 5,
    category: 'positive'
  }
];

// Course Modules
export interface Module {
  id: string;
  name: string;
  description?: string;
  files: { name: string; size: string; type: string }[];
  quiz?: Quiz;
}

export const mockModules: Module[] = [
  {
    id: '1',
    name: 'Module 1: Giới thiệu Python',
    description: 'Tổng quan về Python và cài đặt môi trường',
    files: [
      { name: 'Bài 1: Giới thiệu Python.pdf', size: '2.5 MB', type: 'pdf' },
      { name: 'Bài 2: Biến và kiểu dữ liệu.pdf', size: '1.8 MB', type: 'pdf' }
    ]
  },
  {
    id: '2',
    name: 'Module 2: Cấu trúc điều khiển',
    description: 'If-else, loops, và exception handling',
    files: [
      { name: 'Bài 3: If-else.pdf', size: '1.5 MB', type: 'pdf' },
      { name: 'Bài 4: Vòng lặp.pdf', size: '2.0 MB', type: 'pdf' }
    ]
  },
  {
    id: '3',
    name: 'Module 3: Functions và OOP',
    description: 'Hàm, class, và lập trình hướng đối tượng',
    files: []
  }
];

// Courses for dropdowns
export const mockCoursesList = [
  { code: 'PYTHON-001', name: 'Python cơ bản', students: 25 },
  { code: 'JAVA-002', name: 'Java nâng cao', students: 20 },
  { code: 'WEB-003', name: 'Web Development', students: 18 },
  { code: 'DATA-004', name: 'Data Science', students: 22 }
];


// Mock Quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Kiểm tra Module 1',
    description: 'Bài kiểm tra kiến thức cơ bản về Python',
    type: 'module',
    moduleId: '1',
    duration: 30,
    passingScore: 70,
    totalPoints: 100,
    createdAt: '2024-01-15',
    questions: [
      {
        id: 'q1',
        question: 'Python là ngôn ngữ lập trình gì?',
        type: 'multiple-choice',
        options: [
          'Ngôn ngữ biên dịch',
          'Ngôn ngữ thông dịch',
          'Ngôn ngữ Assembly',
          'Ngôn ngữ máy'
        ],
        correctAnswer: 1,
        points: 25
      },
      {
        id: 'q2',
        question: 'Python hỗ trợ lập trình hướng đối tượng',
        type: 'true-false',
        options: ['Đúng', 'Sai'],
        correctAnswer: 0,
        points: 25
      }
    ]
  }
];
