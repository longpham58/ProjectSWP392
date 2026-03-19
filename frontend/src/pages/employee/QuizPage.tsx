import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { employeeApi, type QuizDto, type QuizResultDto } from '../../api/employee.api';
import { PartyPopper, Frown, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResultDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id || !courseId || !quizId) return;
    employeeApi.getQuiz(Number(courseId), Number(quizId), user.id)
      .then(res => {
        setQuiz(res.data);
        setTimeLeft((res.data.timeLimitMinutes || 15) * 60);
      })
      .catch(err => setError(err.response?.data?.message || 'Không thể tải quiz'))
      .finally(() => setLoading(false));
  }, [courseId, quizId, user?.id]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !user?.id || !courseId || submitting) return;
    setSubmitting(true);
    try {
      const res = await employeeApi.submitQuiz(Number(courseId), quiz.id, {
        userId: user.id,
        answers,
      });
      setResult(res.data);
      setIsSubmitted(true);
    } catch {
      setError('Lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }, [quiz, user?.id, courseId, answers, submitting]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || !quiz) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, quiz, handleSubmit]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Quay lại</button>
    </div>
  );

  if (!quiz || !quiz.questions) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className={`flex justify-center mb-4 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? <PartyPopper size={64} /> : <Frown size={64} />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {result.passed ? 'Chúc mừng! Bạn đã vượt qua!' : 'Chưa đạt yêu cầu'}
            </h2>
            <div className="text-5xl font-bold my-6">
              <span className={result.passed ? 'text-green-600' : 'text-red-600'}>{result.score}%</span>
            </div>
            <p className="text-gray-500 mb-6">Điểm đạt: {result.passingScore}% · Đúng: {result.answers.filter(a => a.isCorrect).length}/{result.answers.length} câu</p>

            {/* Answer Review */}
            <div className="text-left mb-6 max-h-[500px] overflow-y-auto space-y-4">
              <h3 className="font-semibold text-lg">Xem lại đáp án:</h3>
              {result.answers.map((ans, idx) => (
                <div key={ans.questionId} className={`p-4 rounded-lg border-l-4 ${ans.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <p className="font-medium mb-3">Câu {idx + 1}: {ans.question}</p>
                  <div className="space-y-2">
                    {ans.options.map(opt => {
                      const isCorrect = opt.id === ans.correctOptionId;
                      const isSelected = opt.id === ans.selectedOptionId;
                      const isWrong = isSelected && !isCorrect;
                      return (
                        <div key={opt.id} className={`flex items-center gap-2 p-2 rounded text-sm ${
                          isCorrect ? 'bg-green-200 font-medium' :
                          isWrong ? 'bg-red-200' : 'bg-white border border-gray-200'
                        }`}>
                          {isCorrect && <CheckCircle2 size={14} className="text-green-700 flex-shrink-0" />}
                          {isWrong && <XCircle size={14} className="text-red-700 flex-shrink-0" />}
                          <span>{opt.optionText}</span>
                          {isCorrect && <span className="ml-auto text-xs text-green-700 font-semibold">Đáp án đúng</span>}
                          {isWrong && <span className="ml-auto text-xs text-red-700 font-semibold">Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate(`/employee/course/${courseId}`)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                Quay lại khóa học
              </button>
              {!result.passed && (
                <button onClick={() => window.location.reload()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
                  Làm lại
                </button>
              )}
              {result.courseCompleted && (
                <button onClick={() => navigate('/employee/certificates')}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium">
                  Xem chứng chỉ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <div className={`flex items-center gap-2 text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              <Clock size={22} /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-sm text-gray-600">{currentQuestion + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-sm text-gray-500 mb-2">Câu hỏi {currentQuestion + 1}</div>
          <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>

          <div className="space-y-3">
            {currentQ.options.map(opt => (
              <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQ.id] === opt.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQ.id] === opt.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === opt.id && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <span>{opt.optionText}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ← Câu trước
            </button>
            <span className="text-sm text-gray-600">Đã trả lời: {answeredCount}/{questions.length}</span>
            {currentQuestion < questions.length - 1 ? (
              <button onClick={() => setCurrentQuestion(p => p + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Câu sau →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => (
              <button key={q.id} onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg font-medium transition-all text-sm ${
                  idx === currentQuestion ? 'bg-blue-600 text-white' :
                  answers[q.id] !== undefined ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                  'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
