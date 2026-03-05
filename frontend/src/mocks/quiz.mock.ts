import type { CourseModule, Test, TestAttempt, FinalExam, Quiz, Document, Video } from '../types/quiz.types';

// Mock Documents
const mockDocuments: Document[] = [
  { id: 1, title: 'Giới thiệu Microservices.pdf', type: 'PDF', url: '/docs/intro-microservices.pdf', size: '2.5 MB' },
  { id: 2, title: 'Spring Boot Basics.pdf', type: 'PDF', url: '/docs/spring-boot-basics.pdf', size: '3.1 MB' },
  { id: 3, title: 'Architecture Patterns.pptx', type: 'PPTX', url: '/docs/architecture.pptx', size: '5.2 MB' },
  { id: 4, title: 'Best Practices.docx', type: 'DOCX', url: '/docs/best-practices.docx', size: '1.8 MB' },
];

// Mock Videos
const mockVideos: Video[] = [
  { id: 1, title: 'Giới thiệu về Microservices', duration: '15:30', url: '/videos/intro.mp4', thumbnail: 'https://via.placeholder.com/320x180' },
  { id: 2, title: 'Cài đặt Spring Boot', duration: '22:45', url: '/videos/setup.mp4', thumbnail: 'https://via.placeholder.com/320x180' },
  { id: 3, title: 'Xây dựng REST API', duration: '35:20', url: '/videos/rest-api.mp4', thumbnail: 'https://via.placeholder.com/320x180' },
  { id: 4, title: 'Service Discovery với Eureka', duration: '28:15', url: '/videos/eureka.mp4', thumbnail: 'https://via.placeholder.com/320x180' },
];

// Mock Quizzes (small quizzes within modules)
export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    moduleId: 1,
    title: 'Quiz: Kiến thức cơ bản',
    description: 'Kiểm tra hiểu biết về microservices',
    questions: [
      {
        id: 1,
        question: 'Microservice là gì?',
        options: ['Ứng dụng nhỏ', 'Dịch vụ độc lập có thể triển khai riêng', 'Cơ sở dữ liệu', 'Framework frontend'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'Giao thức nào thường dùng cho microservices?',
        options: ['FTP', 'HTTP/REST', 'SMTP', 'Telnet'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    moduleId: 2,
    title: 'Quiz: Spring Boot',
    description: 'Kiểm tra kiến thức Spring Boot',
    questions: [
      {
        id: 3,
        question: 'Annotation nào đánh dấu class chính của Spring Boot?',
        options: ['@Main', '@SpringBootApplication', '@Application', '@Boot'],
        correctAnswer: 1
      }
    ]
  }
];

// Mock Quiz Attempts
export const mockQuizAttempts: any[] = [];

// Mock Tests (3 main assessment tests)
export const mockTests: Test[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Test 1: Kiến thức nền tảng',
    description: 'Đánh giá kiến thức cơ bản về Microservices và Spring Boot',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      {
        id: 1,
        question: 'Microservice là gì?',
        options: ['Ứng dụng nhỏ', 'Dịch vụ độc lập', 'Database', 'Frontend framework'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'Spring Boot dùng để làm gì?',
        options: ['Database', 'Java framework', 'Testing tool', 'IDE'],
        correctAnswer: 1
      },
      {
        id: 3,
        question: 'REST API là gì?',
        options: ['Database', 'Giao thức truyền thông', 'Programming language', 'IDE'],
        correctAnswer: 1
      },
      {
        id: 4,
        question: 'HTTP method nào dùng để tạo resource?',
        options: ['GET', 'POST', 'DELETE', 'PUT'],
        correctAnswer: 1
      },
      {
        id: 5,
        question: 'Status code 200 có nghĩa là gì?',
        options: ['Error', 'Success', 'Not Found', 'Server Error'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    courseId: 1,
    title: 'Test 2: Kiến trúc và Design Patterns',
    description: 'Đánh giá hiểu biết về kiến trúc microservices',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      {
        id: 6,
        question: 'Service Discovery là gì?',
        options: ['Tìm bugs', 'Tự động định vị service instances', 'Tạo services', 'Xóa services'],
        correctAnswer: 1
      },
      {
        id: 7,
        question: 'API Gateway có vai trò gì?',
        options: ['Database gateway', 'Single entry point cho requests', 'Security tool', 'Monitoring tool'],
        correctAnswer: 1
      },
      {
        id: 8,
        question: 'Circuit Breaker pattern dùng để?',
        options: ['Fault tolerance', 'Database pattern', 'UI pattern', 'Testing pattern'],
        correctAnswer: 0
      },
      {
        id: 9,
        question: 'Load Balancer có tác dụng gì?',
        options: ['Phân tải requests', 'Lưu trữ data', 'Compile code', 'Test application'],
        correctAnswer: 0
      },
      {
        id: 10,
        question: 'Eureka là gì?',
        options: ['Database', 'Service discovery tool', 'IDE', 'Testing framework'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 3,
    courseId: 1,
    title: 'Test 3: Triển khai và Vận hành',
    description: 'Đánh giá kỹ năng triển khai và vận hành microservices',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      {
        id: 11,
        question: 'Docker là gì?',
        options: ['Containerization platform', 'Database', 'Programming language', 'IDE'],
        correctAnswer: 0
      },
      {
        id: 12,
        question: 'Kubernetes dùng để?',
        options: ['Database', 'Container orchestration', 'Programming', 'Testing'],
        correctAnswer: 1
      },
      {
        id: 13,
        question: 'CI/CD là gì?',
        options: ['Database', 'Continuous Integration/Deployment', 'Programming language', 'IDE'],
        correctAnswer: 1
      },
      {
        id: 14,
        question: 'Monitoring tool phổ biến?',
        options: ['Prometheus', 'MySQL', 'React', 'Angular'],
        correctAnswer: 0
      },
      {
        id: 15,
        question: 'Log aggregation tool?',
        options: ['MySQL', 'ELK Stack', 'React', 'Docker'],
        correctAnswer: 1
      }
    ]
  }
];

// Mock Test Attempts
export const mockTestAttempts: TestAttempt[] = [
  {
    id: 1,
    testId: 1,
    attemptNumber: 1,
    score: 80,
    passed: true,
    answers: [1, 1, 1, 1, 0],
    completedAt: '2026-02-15T10:30:00'
  },
  {
    id: 2,
    testId: 2,
    attemptNumber: 1,
    score: 60,
    passed: false,
    answers: [1, 1, 0, 0, 1],
    completedAt: '2026-02-20T14:00:00',
    nextAttemptAvailable: '2026-02-20T22:00:00'
  }
];

// Mock Course Modules with documents and videos
export const mockCourseModules: CourseModule[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Module 1: Giới thiệu Microservices',
    description: 'Tìm hiểu khái niệm và lợi ích của kiến trúc microservices',
    order: 1,
    documents: [mockDocuments[0]],
    videos: [mockVideos[0], mockVideos[1]],
    quizzes: [mockQuizzes[0]],
    completed: true
  },
  {
    id: 2,
    courseId: 1,
    title: 'Module 2: Spring Boot Fundamentals',
    description: 'Học các khái niệm cơ bản của Spring Boot',
    order: 2,
    documents: [mockDocuments[1]],
    videos: [mockVideos[2]],
    quizzes: [mockQuizzes[1]],
    completed: false
  },
  {
    id: 3,
    courseId: 1,
    title: 'Module 3: Kiến trúc nâng cao',
    description: 'Các pattern và best practices trong microservices',
    order: 3,
    documents: [mockDocuments[2], mockDocuments[3]],
    videos: [mockVideos[3]],
    quizzes: [],
    completed: false
  }
];

// Mock Final Exam
export const mockFinalExam: FinalExam = {
  id: 1,
  courseId: 1,
  title: 'Bài thi cuối khóa: Spring Boot Microservices',
  description: 'Bài thi tổng hợp toàn bộ kiến thức khóa học',
  passingScore: 75,
  duration: 60,
  unlocked: false,
  questions: [
    ...mockTests[0].questions,
    ...mockTests[1].questions,
    ...mockTests[2].questions,
    {
      id: 16,
      question: 'Saga pattern dùng để?',
      options: ['Manage distributed transactions', 'Database pattern', 'UI pattern', 'Testing'],
      correctAnswer: 0
    },
    {
      id: 17,
      question: 'CQRS là gì?',
      options: ['Database', 'Command Query Responsibility Segregation', 'Programming language', 'IDE'],
      correctAnswer: 1
    },
    {
      id: 18,
      question: 'Event Sourcing là?',
      options: ['Store events instead of state', 'Database', 'Framework', 'IDE'],
      correctAnswer: 0
    },
    {
      id: 19,
      question: 'Service Mesh là gì?',
      options: ['Infrastructure layer', 'Database', 'Programming language', 'IDE'],
      correctAnswer: 0
    },
    {
      id: 20,
      question: 'Istio là?',
      options: ['Database', 'Service mesh platform', 'Programming language', 'IDE'],
      correctAnswer: 1
    }
  ]
};
