import api from '../lib/axios';

export interface QuizDto {
  id: number;
  title: string;
  description: string;
  quizType: string;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  isActive: boolean;
  courseId: number;
  moduleId?: number;
  questions: QuizQuestionDto[];
}

export interface QuizQuestionDto {
  id?: number;
  questionText: string;
  questionType: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks: number;
  explanation?: string;
  displayOrder: number;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  quizType: string;
  durationMinutes: number;
  maxAttempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  courseId: number;
  moduleId?: number;
  questions: Omit<QuizQuestionDto, 'id'>[];
}

export const quizManagementApi = {
  // Get quizzes by module
  getQuizzesByModule: async (moduleId: number): Promise<QuizDto[]> => {
    const response = await api.get(`/quizzes/module/${moduleId}`);
    return response.data.data;
  },

  // Get all quizzes for a course (trainer management)
  getQuizzesByCourse: async (courseId: number): Promise<QuizDto[]> => {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data.data;
  },

  // Get quiz by ID with questions
  getQuizById: async (quizId: number): Promise<QuizDto> => {
    const response = await api.get(`/quizzes/${quizId}/details`);
    return response.data.data;
  },

  // Create new quiz
  createQuiz: async (quizData: CreateQuizRequest): Promise<QuizDto> => {
    const response = await api.post('/quizzes/create', quizData);
    return response.data.data;
  },

  // Update quiz
  updateQuiz: async (quizId: number, quizData: Partial<CreateQuizRequest>): Promise<QuizDto> => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data.data;
  },

  // Delete quiz
  deleteQuiz: async (quizId: number): Promise<void> => {
    await api.delete(`/quizzes/${quizId}`);
  },

  // Toggle quiz active status
  toggleQuizStatus: async (quizId: number): Promise<QuizDto> => {
    const response = await api.patch(`/quizzes/${quizId}/toggle-status`);
    return response.data.data;
  },
};