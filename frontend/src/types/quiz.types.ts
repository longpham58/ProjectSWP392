export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Document {
  id: number;
  title: string;
  type: 'PDF' | 'DOCX' | 'PPTX';
  url: string;
  size: string;
}

export interface Video {
  id: number;
  title: string;
  duration: string;
  url: string;
  thumbnail?: string;
}

export interface Quiz {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface Test {
  id: number;
  courseId: number;
  title: string;
  description: string;
  passingScore: number;
  duration: number;
  maxAttempts: number;
  questions: QuizQuestion[];
  // Additional properties for compatibility with QuizDto
  durationMinutes?: number;
  totalQuestions?: number;
  moduleId?: number | null;
  moduleTitle?: string | null;
  isUnlocked?: boolean;
  attemptsCount?: number;
  hasPassed?: boolean;
}

export interface TestAttempt {
  id: number;
  testId: number;
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
  documents: Document[];
  videos: Video[];
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

export interface UserModuleProgress {
  id: number;
  userId: number;
  moduleId: number;
  moduleTitle: string;
  courseId: number;
  courseName: string;
  enrollmentId: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  progressPercentage: number;
  timeSpentMinutes: number;
  lastAccessedAt: string | null;
  createdAt: string;
}
