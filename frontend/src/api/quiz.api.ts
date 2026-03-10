import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface QuizDto {
  id: number;
  courseId: number;
  courseName: string;
  moduleId: number | null;
  moduleTitle: string | null;
  title: string;
  description: string;
  quizType: string;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  durationMinutes: number;
  duration?: number; // For compatibility with mock types
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  isActive: boolean;
  dueDate: string | null;
  isFinalExam: boolean;
  isUnlocked: boolean;
  attemptsCount: number;
  hasPassed: boolean;
  // Questions from API
  questions?: QuizQuestionDto[];
}

export interface QuizQuestionDto {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
}

export interface QuizAnswerDto {
  questionId: number;
  selectedAnswerIndex: number;
  isCorrect: boolean | null;
  marksObtained: number | null;
}

export interface QuizAttemptDto {
  id: number;
  quizId: number;
  quizTitle: string;
  userId: number;
  userName: string;
  enrollmentId: number | null;
  attemptNumber: number;
  score: number;
  totalMarks: number;
  obtainedMarks: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string | null;
  timeTakenMinutes: number | null;
  status: string;
  answers: QuizAnswerDto[] | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const quizApi = {
  /**
   * Get all quizzes for a course
   */
  getQuizzesByCourse: (courseId: number, userId: number) =>
    axios.get<ApiResponse<QuizDto[]>>(`/quizzes/course/${courseId}/user/${userId}`),

  /**
   * Get quiz by ID
   */
  getQuizById: (quizId: number, userId: number) =>
    axios.get<ApiResponse<QuizDto>>(`/quizzes/${quizId}/user/${userId}`),

  /**
   * Start a new quiz attempt
   */
  startQuizAttempt: (quizId: number, userId: number, enrollmentId: number) =>
    axios.post<ApiResponse<QuizAttemptDto>>("/quizzes/start", { quizId, userId, enrollmentId }),

  /**
   * Submit quiz attempt
   */
  submitQuizAttempt: (attemptId: number, answers: QuizAnswerDto[], timeTakenMinutes: number) =>
    axios.post<ApiResponse<QuizAttemptDto>>("/quizzes/submit", { attemptId, answers, timeTakenMinutes }),

  /**
   * Get user quiz attempts for a specific quiz
   */
  getUserQuizAttempts: (userId: number, quizId: number) =>
    axios.get<ApiResponse<QuizAttemptDto[]>>(`/quizzes/attempts/user/${userId}/quiz/${quizId}`),

  /**
   * Get all quiz attempts for a user in a course
   */
  getUserQuizAttemptsInCourse: (userId: number, courseId: number) =>
    axios.get<ApiResponse<QuizAttemptDto[]>>(`/quizzes/attempts/user/${userId}/course/${courseId}`),
};
