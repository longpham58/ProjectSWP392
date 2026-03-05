export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  description: string;
  passingScore: number;
  duration: number;
  maxAttempts: number;
  retryDelay: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: number[];
  completedAt: string;
  nextAttemptAvailable?: string;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  quizzes: Quiz[];
  completed: boolean;
}

export interface FinalExam {
  id: number;
  courseId: number;
  title: string;
  description: string;
  passingScore: number;
  duration: number;
  unlocked: boolean;
  questions: QuizQuestion[];
}
