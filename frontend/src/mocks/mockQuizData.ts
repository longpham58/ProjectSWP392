// Mock data cho Quiz

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  description: string;
  duration: number; // phút
  totalPoints: number;
  passingScore: number;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'closed';
  createdDate: string;
  dueDate?: string;
  attempts: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentName: string;
  studentId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: 'passed' | 'failed';
  submittedDate: string;
  timeSpent: number; // phút
}

export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Kiểm tra giữa kỳ - Python Cơ bản',
    courseCode: 'PYTHON-001',
    courseName: 'Python cơ bản',
    description: 'Kiểm tra kiến thức về biến, kiểu dữ liệu, và cấu trúc điều khiển',
    duration: 45,
    totalPoints: 100,
    passingScore: 70,
    status: 'published',
    createdDate: '15/12/2024',
    dueDate: '30/12/2024',
    attempts: 18,
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
        correctAnswer: 'Ngôn ngữ thông dịch',
        points: 10,
        explanation: 'Python là ngôn ngữ thông dịch (interpreted language)'
      },
      {
        id: 'q2',
        question: 'Biến trong Python có cần khai báo kiểu dữ liệu không?',
        type: 'true-false',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        points: 10,
        explanation: 'Python là ngôn ngữ dynamic typing, không cần khai báo kiểu'
      },
      {
        id: 'q3',
        question: 'Viết code để in ra "Hello World" trong Python',
        type: 'short-answer',
        correctAnswer: 'print("Hello World")',
        points: 15
      }
    ]
  },
  {
    id: '2',
    title: 'Bài tập tuần 3 - Java OOP',
    courseCode: 'JAVA-002',
    courseName: 'Java nâng cao',
    description: 'Kiểm tra về lập trình hướng đối tượng trong Java',
    duration: 60,
    totalPoints: 100,
    passingScore: 75,
    status: 'published',
    createdDate: '10/12/2024',
    dueDate: '25/12/2024',
    attempts: 15,
    questions: [
      {
        id: 'q1',
        question: 'Tính đóng gói (Encapsulation) trong OOP là gì?',
        type: 'multiple-choice',
        options: [
          'Che giấu thông tin và chỉ cho phép truy cập qua phương thức',
          'Kế thừa từ lớp cha',
          'Đa hình của đối tượng',
          'Trừu tượng hóa dữ liệu'
        ],
        correctAnswer: 'Che giấu thông tin và chỉ cho phép truy cập qua phương thức',
        points: 20
      }
    ]
  },
  {
    id: '3',
    title: 'Quiz cuối khóa - Web Development',
    courseCode: 'WEB-003',
    courseName: 'Web Development',
    description: 'Tổng hợp kiến thức HTML, CSS, JavaScript',
    duration: 90,
    totalPoints: 150,
    passingScore: 80,
    status: 'draft',
    createdDate: '20/12/2024',
    attempts: 0,
    questions: []
  }
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: '1',
    quizId: '1',
    studentName: 'Nguyễn Văn A',
    studentId: 'SV001',
    score: 85,
    totalPoints: 100,
    percentage: 85,
    status: 'passed',
    submittedDate: '16/12/2024 14:30',
    timeSpent: 38
  },
  {
    id: '2',
    quizId: '1',
    studentName: 'Trần Thị B',
    studentId: 'SV002',
    score: 92,
    totalPoints: 100,
    percentage: 92,
    status: 'passed',
    submittedDate: '16/12/2024 15:20',
    timeSpent: 42
  },
  {
    id: '3',
    quizId: '1',
    studentName: 'Lê Văn C',
    studentId: 'SV003',
    score: 65,
    totalPoints: 100,
    percentage: 65,
    status: 'failed',
    submittedDate: '17/12/2024 10:15',
    timeSpent: 45
  }
];

// Template Excel format cho import
export const EXCEL_TEMPLATE_INFO = {
  columns: [
    'STT',
    'Câu hỏi',
    'Loại (multiple-choice/true-false/short-answer)',
    'Đáp án A',
    'Đáp án B',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng',
    'Điểm',
    'Giải thích'
  ],
  example: [
    {
      stt: 1,
      question: 'Python là ngôn ngữ lập trình gì?',
      type: 'multiple-choice',
      optionA: 'Ngôn ngữ biên dịch',
      optionB: 'Ngôn ngữ thông dịch',
      optionC: 'Ngôn ngữ Assembly',
      optionD: 'Ngôn ngữ máy',
      correctAnswer: 'B',
      points: 10,
      explanation: 'Python là ngôn ngữ thông dịch'
    },
    {
      stt: 2,
      question: 'Biến trong Python có cần khai báo kiểu không?',
      type: 'true-false',
      optionA: 'Đúng',
      optionB: 'Sai',
      optionC: '',
      optionD: '',
      correctAnswer: 'B',
      points: 10,
      explanation: 'Python là dynamic typing'
    }
  ]
};
