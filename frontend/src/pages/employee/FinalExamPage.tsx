import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { employeeApi, type QuizDto, type QuizResultDto } from '../../api/employee.api';
import { Trophy, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, PartyPopper, Frown } from 'lucide-react';

export default function FinalExamPage() {
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
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user?.id || !courseId || !quizId) return;
    employeeApi.getQuiz(Number(courseId), Number(quizId), user.id)
      .then(res => {
        const q = res.data as unknown as QuizDto;
        setQuiz(q);
        setTimeLeft((q.timeLimitMinutes || 60) * 60);
      })
      .catch(err => setError(err.response?.data?.message || 'Không thể tải bài thi'))
      .finally(() => setLoading(false));
  }, [courseId, quizId, user?.id]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !user?.id || !courseId || submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const res = await employeeApi.submitQuiz(Number(courseId), quiz.id, { userId: user.id, answers });
      setResult(res.data as unknown as QuizResultDto);
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

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-purple-600" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Quay lại</button>
    </div>
  );

  if (!quiz || !quiz.questions) return null;

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className={`flex justify-center mb-4 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? <PartyPopper size={64} /> : <Frown size={64} />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {result.passed ? 'Xuất sắc! Bạn đã vượt qua bài thi cuối kỳ!' : 'Chưa đạt yêu cầu'}
            </h2>
            <div className="text-5xl font-bold my-6">
              <span className={result.passed ? 'text-green-600' : 'text-red-600'}>{result.score}%</span>
            </div>
            <p className="text-gray-500 mb-6">Điểm đạt: {result.passingScore}%</p>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/employee/course/${courseId}`)}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium">
                Quay lại khóa học
              </button>
              {!result.passed && (
                <button onClick={() => window.location.reload()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
                  Làm lại
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold flex items-center gap-2"><Trophy size={20} /> {quiz.title}</h1>
            <div className={`flex items-center gap-2 text-2xl font-bold ${timeLeft < 120 ? 'text-yellow-300' : 'text-white'}`}>
              <Clock size={22} /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-sm">{currentQuestion + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Câu hỏi {currentQuestion + 1}</div>
            <div className={`px-3 py-1 rounded-full text-sm ${answers[currentQ.id] !== undefined ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {answers[currentQ.id] !== undefined ? <><CheckCircle2 size={13} className="inline mr-1" />Đã trả lời</> : 'Chưa trả lời'}
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>
          <div className="space-y-3">
            {currentQ.options.map(opt => (
              <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQ.id] === opt.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQ.id] === opt.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Câu tiếp →
              </button>
            ) : (
              <button onClick={() => setShowConfirm(true)} disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium flex items-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, idx) => (
              <button key={q.id} onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                  idx === currentQuestion ? 'bg-purple-600 text-white ring-2 ring-purple-300' :
                  answers[q.id] !== undefined ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                  'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-2">Bạn đã trả lời {answeredCount}/{questions.length} câu hỏi.</p>
            {answeredCount < questions.length && (
              <p className="text-orange-600 mb-4 flex items-center gap-1">
                <AlertTriangle size={15} /> Còn {questions.length - answeredCount} câu chưa trả lời!
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
