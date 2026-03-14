import { create } from "zustand";
import { quizApi, QuizDto, QuizAttemptDto, QuizAnswerDto } from "../api/quiz.api";

interface QuizState {
  quizzes: QuizDto[];
  currentQuiz: QuizDto | null;
  currentAttempt: QuizAttemptDto | null;
  attempts: QuizAttemptDto[];
  finalExam: QuizDto | null;
  loading: boolean;
  error: string | null;
  courseQuizStatus: any | null;

  fetchQuizzes: (courseId: number, userId: number) => Promise<void>;
  fetchQuizById: (quizId: number, userId: number) => Promise<void>;
  fetchQuizAttemptsInCourse: (userId: number, courseId: number) => Promise<void>;
  fetchFinalExam: (courseId: number, userId: number) => Promise<void>;
  startQuizAttempt: (quizId: number, userId: number, enrollmentId: number | null) => Promise<QuizAttemptDto | null>;
  submitQuizAttempt: (attemptId: number, answers: QuizAnswerDto[], timeTakenMinutes: number) => Promise<QuizAttemptDto | null>;
  fetchQuizAttempts: (userId: number, quizId: number) => Promise<void>;
  fetchCourseQuizStatus: (courseId: number, userId: number) => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  attempts: [],
  finalExam: null,
  loading: false,
  error: null,
  courseQuizStatus: null,

  fetchQuizzes: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getQuizzesByCourse(courseId, userId);
      set({ quizzes: res.data.data || [], loading: false });
    } catch (error: any) {
      console.log('fetchQuizzes API failed:', error.message);
      set({ quizzes: [], loading: false, error: error.message });
    }
  },

  fetchQuizById: async (quizId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getQuizById(quizId, userId);
      set({ currentQuiz: res.data.data, loading: false });
    } catch (error: any) {
      console.log('fetchQuizById API failed:', error.message);
      set({ currentQuiz: null, loading: false, error: error.message });
    }
  },

  fetchQuizAttemptsInCourse: async (userId: number, courseId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getUserQuizAttemptsInCourse(userId, courseId);
      set({ attempts: res.data.data || [], loading: false });
    } catch (error: any) {
      console.log('fetchQuizAttemptsInCourse API failed:', error.message);
      set({ attempts: [], loading: false, error: error.message });
    }
  },

  fetchFinalExam: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getQuizzesByCourse(courseId, userId);
      const quizzes = res.data.data || [];
      const finalExam = quizzes.find((q: QuizDto) => q.isFinalExam === true);
      set({ finalExam: finalExam || null, loading: false });
    } catch (error: any) {
      console.log('fetchFinalExam API failed:', error.message);
      set({ finalExam: null, loading: false, error: error.message });
    }
  },

  startQuizAttempt: async (quizId: number, userId: number, enrollmentId: number | null) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.startQuizAttempt(quizId, userId, enrollmentId);
      console.log('startQuizAttempt API response:', res);
      const result = res.data.data;
      set({ currentAttempt: result, loading: false });
      return result;
    } catch (error: any) {
      console.log('startQuizAttempt API failed:', error.message);
      set({ loading: false, error: error.message });
      return null;
    }
  },

  submitQuizAttempt: async (attemptId: number, answers: QuizAnswerDto[], timeTakenMinutes: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.submitQuizAttempt(attemptId, answers, timeTakenMinutes);
      const result = res.data.data;
      set({ currentAttempt: result, loading: false });
      return result;
    } catch (error: any) {
      console.log('submitQuizAttempt API failed:', error.message);
      set({ loading: false, error: error.message });
      return null;
    }
  },

  fetchQuizAttempts: async (userId: number, quizId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getUserQuizAttempts(userId, quizId);
      set({ attempts: res.data.data || [], loading: false });
    } catch (error: any) {
      console.log('fetchQuizAttempts API failed:', error.message);
      set({ attempts: [], loading: false, error: error.message });
    }
  },

  resetQuiz: () => {
    set({ currentQuiz: null, currentAttempt: null, attempts: [], error: null });
  },

  fetchCourseQuizStatus: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getCourseQuizStatus(courseId, userId);
      set({ courseQuizStatus: res.data.data, loading: false });
    } catch (error: any) {
      console.log('fetchCourseQuizStatus API failed:', error.message);
      set({ courseQuizStatus: null, loading: false, error: error.message });
    }
  },
}));
