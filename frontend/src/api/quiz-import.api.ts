import api from '../lib/axios';

export interface QuizImportResponse {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  courseId: number;
  moduleId?: number;
}

export const quizImportApi = {
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