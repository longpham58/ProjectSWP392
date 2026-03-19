import api from '../lib/axios';

export interface QuizImportResponse {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  courseId: number;
  moduleId?: number;
}

export interface ParsedQuizResponse {
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  quizType: string;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  questions: {
    questionText: string;
    questionType: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    marks: number;
    explanation: string;
    displayOrder: number;
  }[];
}

export const quizImportApi = {
  // Parse Excel file and preview data (without creating quiz)
  parseExcel: async (file: File): Promise<ParsedQuizResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/quizzes/parse-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Import quiz from Excel file
  importQuiz: async (
    file: File,
    courseId: number,
    moduleId?: number
  ): Promise<QuizImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId.toString());
    if (moduleId) {
      formData.append('moduleId', moduleId.toString());
    }

    const response = await api.post('/quizzes/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Download Excel template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/quizzes/template', {
      responseType: 'blob',
    });
    return response.data;
  },
};