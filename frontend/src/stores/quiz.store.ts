import { create } from "zustand";
import { quizApi, QuizDto, QuizAttemptDto, QuizAnswerDto } from "../api/quiz.api";
import { mockQuizzes, mockQuizAttempts, mockTestAttempts, mockTests, mockFinalExam } from "../mocks/quiz.mock";
import { useAuthStore } from "./auth.store";

interface QuizState {
  quizzes: QuizDto[];
  currentQuiz: QuizDto | null;
  currentAttempt: QuizAttemptDto | null;
  attempts: QuizAttemptDto[];
  finalExam: QuizDto | null;
  loading: boolean;
  error: string | null;
  // Course quiz status
  courseQuizStatus: any | null;

  fetchQuizzes: (courseId: number, userId: number) => Promise<void>;
  fetchQuizById: (quizId: number, userId: number) => Promise<void>;
  fetchQuizAttemptsInCourse: (userId: number, courseId: number) => Promise<void>;
  fetchFinalExam: (courseId: number, userId: number) => Promise<void>;
  startQuizAttempt: (quizId: number, userId: number, enrollmentId: number) => Promise<void>;
  submitQuizAttempt: (attemptId: number, answers: QuizAnswerDto[], timeTakenMinutes: number) => Promise<void>;
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
      // If API returns data, use it; otherwise fallback to mock tests
      if (res.data.data && res.data.data.length > 0) {
        set({ quizzes: res.data.data, loading: false });
      } else {
        // Fallback to mock tests filtered by courseId
        const courseTests = mockTests.filter((t: any) => t.courseId === courseId);
        if (courseTests.length > 0) {
          // Convert mock tests to quiz format
          const convertedTests = courseTests.map((t: any) => ({
            id: t.id,
            courseId: t.courseId,
            courseName: '',
            moduleId: null,
            moduleTitle: null,
            title: t.title,
            description: t.description,
            quizType: 'PRE_TEST',
            totalQuestions: t.questions?.length || 0,
            totalMarks: t.questions?.length || 0,
            passingScore: t.passingScore || 70,
            durationMinutes: t.duration || 30,
            maxAttempts: t.maxAttempts || 3,
            randomizeQuestions: false,
            showCorrectAnswers: true,
            isActive: true,
            dueDate: null,
            isFinalExam: false,
            isUnlocked: true,
            attemptsCount: 0,
            hasPassed: false,
            questions: t.questions?.map((q: any) => ({
              id: q.id,
              questionText: q.question,
              questionType: 'SINGLE_CHOICE',
              options: q.options,
              correctAnswerIndex: q.correctAnswer,
              marks: 1
            }))
          }));
          set({ quizzes: convertedTests, loading: false });
        } else {
          set({ quizzes: [], loading: false });
        }
      }
    } catch (error: any) {
      console.log('fetchQuizzes API failed:', error.message);
      // Fallback to mock tests on error
      const courseTests = mockTests.filter((t: any) => t.courseId === courseId);
      if (courseTests.length > 0) {
        const convertedTests = courseTests.map((t: any) => ({
          id: t.id,
          courseId: t.courseId,
          courseName: '',
          moduleId: null,
          moduleTitle: null,
          title: t.title,
          description: t.description,
          quizType: 'PRE_TEST',
          totalQuestions: t.questions?.length || 0,
          totalMarks: t.questions?.length || 0,
          passingScore: t.passingScore || 70,
          durationMinutes: t.duration || 30,
          maxAttempts: t.maxAttempts || 3,
          randomizeQuestions: false,
          showCorrectAnswers: true,
          isActive: true,
          dueDate: null,
          isFinalExam: false,
          isUnlocked: true,
          attemptsCount: 0,
          hasPassed: false,
          questions: t.questions?.map((q: any) => ({
            id: q.id,
            questionText: q.question,
            questionType: 'SINGLE_CHOICE',
            options: q.options,
            correctAnswerIndex: q.correctAnswer,
            marks: 1
          }))
        }));
        set({ quizzes: convertedTests, loading: false, error: error.message });
      } else {
        set({ quizzes: [], loading: false, error: error.message });
      }
    }
  },

  fetchQuizById: async (quizId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getQuizById(quizId, userId);
      // If API returns data, use it; otherwise fallback to mock data
      if (res.data.data) {
        set({ currentQuiz: res.data.data, loading: false });
      } else {
        // Fallback to mock quiz
        const mockQuiz = mockQuizzes.find(q => q.id === quizId);
        if (mockQuiz) {
          // Convert mock quiz format to QuizDto format
          const convertedQuiz: QuizDto = {
            id: mockQuiz.id,
            courseId: mockQuiz.moduleId,
            courseName: '',
            moduleId: mockQuiz.moduleId,
            moduleTitle: null,
            title: mockQuiz.title,
            description: mockQuiz.description,
            quizType: mockQuiz.quizType || 'PRACTICE',
            totalQuestions: mockQuiz.questions?.length || 0,
            totalMarks: mockQuiz.questions?.length || 0,
            passingScore: mockQuiz.passingScore || 70,
            durationMinutes: mockQuiz.durationMinutes || 15,
            maxAttempts: mockQuiz.maxAttempts || 3,
            randomizeQuestions: false,
            showCorrectAnswers: true,
            isActive: true,
            dueDate: null,
            isFinalExam: false,
            isUnlocked: true,
            attemptsCount: 0,
            hasPassed: false,
            questions: mockQuiz.questions?.map((q, idx) => ({
              id: q.id,
              questionText: q.question,
              questionType: 'SINGLE_CHOICE',
              options: q.options,
              correctAnswerIndex: q.correctAnswer,
              marks: 1
            }))
          };
          set({ currentQuiz: convertedQuiz, loading: false });
        } else {
          set({ currentQuiz: null, loading: false });
        }
      }
    } catch (error: any) {
      console.log('fetchQuizById API failed:', error.message);
      // Fallback to mock quiz
      const mockQuiz = mockQuizzes.find(q => q.id === quizId);
      if (mockQuiz) {
        // Convert mock quiz format to QuizDto format
        const convertedQuiz: QuizDto = {
          id: mockQuiz.id,
          courseId: mockQuiz.moduleId,
          courseName: '',
          moduleId: mockQuiz.moduleId,
          moduleTitle: null,
          title: mockQuiz.title,
          description: mockQuiz.description,
          quizType: mockQuiz.quizType || 'PRACTICE',
          totalQuestions: mockQuiz.questions?.length || 0,
          totalMarks: mockQuiz.questions?.length || 0,
          passingScore: mockQuiz.passingScore || 70,
          durationMinutes: mockQuiz.durationMinutes || 15,
          maxAttempts: mockQuiz.maxAttempts || 3,
          randomizeQuestions: false,
          showCorrectAnswers: true,
          isActive: true,
          dueDate: null,
          isFinalExam: false,
          isUnlocked: true,
          attemptsCount: 0,
          hasPassed: false,
          questions: mockQuiz.questions?.map((q) => ({
            id: q.id,
            questionText: q.question,
            questionType: 'SINGLE_CHOICE',
            options: q.options,
            correctAnswerIndex: q.correctAnswer,
            marks: 1
          }))
        };
        set({ currentQuiz: convertedQuiz, loading: false });
      } else {
        set({ currentQuiz: null, loading: false, error: error.message });
      }
    }
  },

  fetchQuizAttemptsInCourse: async (userId: number, courseId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getUserQuizAttemptsInCourse(userId, courseId);
      // If API returns data, use it; otherwise fallback to mock data
      if (res.data.data && res.data.data.length > 0) {
        set({ attempts: res.data.data, loading: false });
      } else {
        console.log('No quiz attempts from API for user:', userId, 'course:', courseId, '- using mock data');
        // Filter mock test attempts by courseId
        const mockAttempts = mockTestAttempts.filter((a: any) => mockTests.some((t: any) => t.courseId === courseId && t.id === a.testId));
        set({ attempts: mockAttempts as unknown as QuizAttemptDto[], loading: false });
      }
    } catch (error: any) {
      console.log('fetchQuizAttemptsInCourse API failed:', error.message);
      // Fallback to mock data on error
      const mockAttempts = mockTestAttempts.filter((a: any) => mockTests.some((t: any) => t.courseId === courseId && t.id === a.testId));
      set({ attempts: mockAttempts as unknown as QuizAttemptDto[], loading: false, error: error.message });
    }
  },

  fetchFinalExam: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      // First get all quizzes for the course and find the final exam
      const res = await quizApi.getQuizzesByCourse(courseId, userId);
      const quizzes = res.data.data;
      
      // Find quiz with isFinalExam = true
      const finalExam = quizzes.find((q: QuizDto) => q.isFinalExam === true);
      
      if (finalExam) {
        set({ finalExam: finalExam, loading: false });
      } else {
        console.log('No final exam found from API for course:', courseId, '- using mock data');
        // Fallback to mock final exam
        set({ finalExam: mockFinalExam as unknown as QuizDto, loading: false });
      }
    } catch (error: any) {
      console.log('fetchFinalExam API failed:', error.message);
      // Fallback to mock data on error
      set({ finalExam: mockFinalExam as unknown as QuizDto, loading: false, error: error.message });
    }
  },

  startQuizAttempt: async (quizId: number, userId: number, enrollmentId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.startQuizAttempt(quizId, userId, enrollmentId);
      set({ currentAttempt: res.data.data, loading: false });
    } catch (error: any) {
      console.log('startQuizAttempt API failed:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  submitQuizAttempt: async (attemptId: number, answers: QuizAnswerDto[], timeTakenMinutes: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.submitQuizAttempt(attemptId, answers, timeTakenMinutes);
      set({ currentAttempt: res.data.data, loading: false });
    } catch (error: any) {
      console.log('submitQuizAttempt API failed:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  fetchQuizAttempts: async (userId: number, quizId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getUserQuizAttempts(userId, quizId);
      // If API returns data, use it; otherwise fallback to mock data
      if (res.data.data && res.data.data.length > 0) {
        set({ attempts: res.data.data, loading: false });
      } else {
        // Fallback to mock quiz attempts
        const mockAttempts = mockQuizAttempts.filter((a: any) => a.quizId === quizId);
        set({ attempts: mockAttempts as unknown as QuizAttemptDto[], loading: false });
      }
    } catch (error: any) {
      console.log('fetchQuizAttempts API failed:', error.message);
      // Fallback to mock quiz attempts
      const mockAttempts = mockQuizAttempts.filter((a: any) => a.quizId === quizId);
      set({ attempts: mockAttempts as unknown as QuizAttemptDto[], loading: false, error: error.message });
    }
  },

  resetQuiz: () => {
    set({ currentQuiz: null, currentAttempt: null, attempts: [], error: null });
  },

  fetchCourseQuizStatus: async (courseId: number, userId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await quizApi.getCourseQuizStatus(courseId, userId);
      if (res.data.data) {
        set({ courseQuizStatus: res.data.data, loading: false });
      } else {
        set({ courseQuizStatus: null, loading: false });
      }
    } catch (error: any) {
      console.log('fetchCourseQuizStatus API failed:', error.message);
      set({ courseQuizStatus: null, loading: false, error: error.message });
    }
  },
}));
