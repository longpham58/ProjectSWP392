import type { Quiz, QuizAttempt, CourseModule, FinalExam } from '../types/quiz.types';

// Mock Quizzes for Course ID 3 (Spring Boot Microservices)
export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    courseId: 3,
    title: 'Quiz 1: Introduction to Microservices',
    description: 'Test your understanding of microservices basics',
    passingScore: 70,
    duration: 15,
    maxAttempts: 3,
    retryDelay: 8,
    questions: [
      {
        id: 1,
        question: 'What is a microservice?',
        options: [
          'A small application',
          'An independently deployable service',
          'A database',
          'A frontend framework'
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'Which protocol is commonly used for microservices communication?',
        options: ['FTP', 'HTTP/REST', 'SMTP', 'Telnet'],
        correctAnswer: 1
      },
      {
        id: 3,
        question: 'What is Spring Boot?',
        options: [
          'A database',
          'A Java framework for building applications',
          'A testing tool',
          'An IDE'
        ],
        correctAnswer: 1
      },
      {
        id: 4,
        question: 'What does API stand for?',
        options: [
          'Application Programming Interface',
          'Advanced Programming Integration',
          'Automated Process Integration',
          'Application Process Interface'
        ],
        correctAnswer: 0
      },
      {
        id: 5,
        question: 'Which is a benefit of microservices?',
        options: [
          'Increased complexity',
          'Independent deployment',
          'Single point of failure',
          'Monolithic architecture'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    courseId: 3,
    title: 'Quiz 2: Spring Boot Fundamentals',
    description: 'Test your Spring Boot knowledge',
    passingScore: 70,
    duration: 15,
    maxAttempts: 3,
    retryDelay: 8,
    questions: [
      {
        id: 6,
        question: 'What annotation is used to mark a Spring Boot main class?',
        options: ['@Main', '@SpringBootApplication', '@Application', '@Boot'],
        correctAnswer: 1
      },
      {
        id: 7,
        question: 'Which file is used for Spring Boot configuration?',
        options: ['config.xml', 'application.properties', 'settings.json', 'boot.config'],
        correctAnswer: 1
      },
      {
        id: 8,
        question: 'What is dependency injection?',
        options: [
          'A design pattern',
          'A database query',
          'A testing method',
          'A deployment strategy'
        ],
        correctAnswer: 0
      },
      {
        id: 9,
        question: 'Which annotation is used for REST controllers?',
        options: ['@Controller', '@RestController', '@Service', '@Repository'],
        correctAnswer: 1
      },
      {
        id: 10,
        question: 'What is the default port for Spring Boot applications?',
        options: ['8080', '3000', '80', '443'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 3,
    courseId: 3,
    title: 'Quiz 3: Microservices Architecture',
    description: 'Advanced microservices concepts',
    passingScore: 70,
    duration: 15,
    maxAttempts: 3,
    retryDelay: 8,
    questions: [
      {
        id: 11,
        question: 'What is service discovery?',
        options: [
          'Finding bugs in services',
          'Automatically locating service instances',
          'Creating new services',
          'Deleting old services'
        ],
        correctAnswer: 1
      },
      {
        id: 12,
        question: 'Which tool is used for service discovery in Spring Cloud?',
        options: ['Consul', 'Eureka', 'Zookeeper', 'All of the above'],
        correctAnswer: 3
      },
      {
        id: 13,
        question: 'What is an API Gateway?',
        options: [
          'A database gateway',
          'A single entry point for all client requests',
          'A security tool',
          'A monitoring tool'
        ],
        correctAnswer: 1
      },
      {
        id: 14,
        question: 'What is circuit breaker pattern?',
        options: [
          'A design pattern for fault tolerance',
          'A database pattern',
          'A UI pattern',
          'A testing pattern'
        ],
        correctAnswer: 0
      },
      {
        id: 15,
        question: 'Which is a challenge of microservices?',
        options: [
          'Easy deployment',
          'Distributed system complexity',
          'Simple testing',
          'Single database'
        ],
        correctAnswer: 1
      }
    ]
  }
];

// Mock Quiz Attempts
export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 1,
    quizId: 1,
    attemptNumber: 1,
    score: 80,
    passed: true,
    answers: [1, 1, 1, 0, 1],
    completedAt: '2026-02-15T10:30:00'
  },
  {
    id: 2,
    quizId: 2,
    attemptNumber: 1,
    score: 60,
    passed: false,
    answers: [1, 1, 0, 1, 0],
    completedAt: '2026-02-20T14:00:00',
    nextAttemptAvailable: '2026-02-20T22:00:00'
  }
];

// Mock Course Modules
export const mockCourseModules: CourseModule[] = [
  {
    id: 1,
    courseId: 3,
    title: 'Module 1: Introduction',
    description: 'Getting started with microservices',
    order: 1,
    quizzes: [mockQuizzes[0]],
    completed: true
  },
  {
    id: 2,
    courseId: 3,
    title: 'Module 2: Spring Boot Basics',
    description: 'Learn Spring Boot fundamentals',
    order: 2,
    quizzes: [mockQuizzes[1]],
    completed: false
  },
  {
    id: 3,
    courseId: 3,
    title: 'Module 3: Advanced Topics',
    description: 'Advanced microservices patterns',
    order: 3,
    quizzes: [mockQuizzes[2]],
    completed: false
  }
];

// Mock Final Exam
export const mockFinalExam: FinalExam = {
  id: 1,
  courseId: 3,
  title: 'Final Exam: Spring Boot Microservices',
  description: 'Comprehensive final examination',
  passingScore: 75,
  duration: 60,
  unlocked: false, // Will be unlocked when 2/3 quizzes passed
  questions: [
    // 20 questions for final exam
    ...mockQuizzes[0].questions,
    ...mockQuizzes[1].questions,
    ...mockQuizzes[2].questions,
    {
      id: 16,
      question: 'What is Docker?',
      options: [
        'A containerization platform',
        'A database',
        'A programming language',
        'An IDE'
      ],
      correctAnswer: 0
    },
    {
      id: 17,
      question: 'What is Kubernetes?',
      options: [
        'A database',
        'A container orchestration platform',
        'A programming language',
        'A testing framework'
      ],
      correctAnswer: 1
    }
  ]
};
