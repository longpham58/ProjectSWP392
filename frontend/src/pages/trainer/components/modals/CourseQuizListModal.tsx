import React, { useState, useEffect } from 'react';
import { quizManagementApi, QuizDto } from '../../../../api/quiz-management.api';
import { ImportQuizModal } from './ImportQuizModal';
import { CreateQuizModal } from './CreateQuizModal';

interface CourseQuizListModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseName: string;
}

export const CourseQuizListModal: React.FC<CourseQuizListModalProps> = ({
  isOpen, onClose, courseId, courseName,
}) => {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDto | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) loadQuizzes();
  }, [isOpen, courseId]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizManagementApi.getQuizzesByCourse(courseId);
      // Chỉ hiển thị quiz tổng (không gắn module)
      setQuizzes(data.filter(q => !q.moduleId));
    } catch (err) {
      console.error('Error loading quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestions = async (quiz: QuizDto) => {
    try {
      const detail = await quizManagementApi.getQuizById(quiz.id);
      setSelectedQuiz(detail);
    } catch (err) {
      console.error('Error loading quiz details:', err);
    }
  };

  const handleToggleStatus = async (quizId: number) => {
    try {
      await quizManagementApi.toggleQuizStatus(quizId);
      loadQuizzes();
    } catch (err) {
      console.error('Error toggling quiz status:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Bạn có chắc muốn xóa quiz này?')) return;
    try {
      await quizManagementApi.deleteQuiz(quizId);
      loadQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  if (!isOpen) return null;

  // Sub-modals (import/create) — render on top
  if (showImport) {
    return (
      <ImportQuizModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        courseId={courseId}
        moduleId={undefined}
        onSuccess={() => { setShowImport(false); loadQuizzes(); }}
      />
    );
  }

  if (showCreate) {
    return (
      <CreateQuizModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        courseId={courseId}
        moduleId={undefined}
        moduleTitle={`Khóa học: ${courseName}`}
        onSuccess={() => { setShowCreate(false); loadQuizzes(); }}
      />
    );
  }

  // Detail view
  if (selectedQuiz) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedQuiz.title}</h2>
              <p className="text-gray-500 text-sm">{selectedQuiz.totalQuestions} câu hỏi</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedQuiz(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">← Quay lại</button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
          </div>
          <div className="space-y-6">
            {selectedQuiz.questions.map((q, i) => (
              <div key={q.id ?? i} className="border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">CÂU {i + 1}</span>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{q.marks ?? 1} điểm</span>
                </div>
                <p className="text-base font-semibold text-gray-900 mb-4">{q.questionText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map(label => {
                    const text = q[`option${label}` as keyof typeof q] as string;
                    const isCorrect = q.correctAnswer === label;
                    return (
                      <div key={label} className={`p-3 rounded-lg border flex items-center gap-3 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{label}</span>
                        <span className="flex-1 text-sm">{text}</span>
                        {isCorrect && <span className="text-green-600 font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm text-gray-700">
                    <span className="font-semibold text-blue-800">Giải thích: </span>{q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Bài kiểm tra khóa học</h2>
            <p className="text-gray-500 text-sm">{courseName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Import Quiz
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Tạo Quiz
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none ml-2">&times;</button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Quiz tổng (theo khóa học)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Quiz module</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có bài kiểm tra nào. Hãy tạo quiz mới!</div>
        ) : (
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <div key={quiz.id} className={`border-l-4 rounded-lg p-4 bg-white shadow-sm ${quiz.moduleId ? 'border-purple-400' : 'border-blue-400'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      {quiz.moduleId ? (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">Quiz module</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Quiz tổng</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {quiz.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                    {quiz.description && <p className="text-gray-500 text-sm mb-1">{quiz.description}</p>}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>{quiz.totalQuestions} câu</span>
                      <span>{quiz.durationMinutes} phút</span>
                      <span>Điểm đạt: {quiz.passingScore}%</span>
                      <span>Tối đa {quiz.maxAttempts} lần</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button onClick={() => handleViewQuestions(quiz)} className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Xem câu hỏi</button>
                    <button
                      onClick={() => handleToggleStatus(quiz.id)}
                      className={`px-3 py-1.5 rounded text-sm ${quiz.isActive ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      {quiz.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>
                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600">Xóa</button>
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
