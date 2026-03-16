import React, { useState, useEffect } from 'react';
import { quizManagementApi, QuizDto } from '../../../../api/quiz-management.api';

interface QuizListModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: number;
  moduleTitle: string;
}

export const QuizListModal: React.FC<QuizListModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
}) => {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDto | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    if (isOpen && moduleId) {
      loadQuizzes();
    }
  }, [isOpen, moduleId]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizManagementApi.getQuizzesByModule(moduleId);
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestions = async (quiz: QuizDto) => {
    try {
      const detailedQuiz = await quizManagementApi.getQuizById(quiz.id);
      setSelectedQuiz(detailedQuiz);
      setShowQuestions(true);
    } catch (error) {
      console.error('Error loading quiz details:', error);
    }
  };

  const handleToggleStatus = async (quizId: number) => {
    try {
      await quizManagementApi.toggleQuizStatus(quizId);
      loadQuizzes(); // Reload list
    } catch (error) {
      console.error('Error toggling quiz status:', error);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (confirm('Bạn có chắc muốn xóa quiz này?')) {
      try {
        await quizManagementApi.deleteQuiz(quizId);
        loadQuizzes(); // Reload list
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  if (!isOpen) return null;

  if (showQuestions && selectedQuiz) {
    return (
      <QuizQuestionsView
        quiz={selectedQuiz}
        onBack={() => {
          setShowQuestions(false);
          setSelectedQuiz(null);
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Quiz của Module: {moduleTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có quiz nào cho module này
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📝 {quiz.totalQuestions} câu hỏi</span>
                      <span>⏱️ {quiz.durationMinutes} phút</span>
                      <span>🎯 {quiz.passingScore}% để qua</span>
                      <span>🔄 Tối đa {quiz.maxAttempts} lần</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {quiz.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewQuestions(quiz)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Xem câu hỏi
                    </button>
                    <button
                      onClick={() => handleToggleStatus(quiz.id)}
                      className={`px-3 py-1 rounded text-sm ${
                        quiz.isActive 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {quiz.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Component hiển thị chi tiết câu hỏi
const QuizQuestionsView: React.FC<{
  quiz: QuizDto;
  onBack: () => void;
  onClose: () => void;
}> = ({ quiz, onBack, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
            <p className="text-gray-600">{quiz.totalQuestions} câu hỏi</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              ← Quay lại
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">Câu {index + 1}</h3>
                <span className="text-sm text-gray-500">{question.marks} điểm</span>
              </div>
              
              <p className="mb-3 font-medium">{question.questionText}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className={`p-2 rounded ${question.correctAnswer === 'A' ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
                  <span className="font-medium">A. </span>{question.optionA}
                </div>
                <div className={`p-2 rounded ${question.correctAnswer === 'B' ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
                  <span className="font-medium">B. </span>{question.optionB}
                </div>
                <div className={`p-2 rounded ${question.correctAnswer === 'C' ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
                  <span className="font-medium">C. </span>{question.optionC}
                </div>
                <div className={`p-2 rounded ${question.correctAnswer === 'D' ? 'bg-green-100 border-green-300' : 'bg-gray-50'}`}>
                  <span className="font-medium">D. </span>{question.optionD}
                </div>
              </div>
              
              <div className="text-sm text-green-600 font-medium mb-2">
                ✓ Đáp án đúng: {question.correctAnswer}
              </div>
              
              {question.explanation && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Giải thích:</strong> {question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};