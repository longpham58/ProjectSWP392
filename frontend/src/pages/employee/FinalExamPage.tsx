import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockFinalExam } from '../../mocks/quiz.mock';

export default function FinalExamPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(mockFinalExam.duration * 60); // Convert to seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(mockFinalExam.questions.length).fill(-1));
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < mockFinalExam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    mockFinalExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / mockFinalExam.questions.length) * 100);
    const passed = score >= mockFinalExam.passingScore;

    // Navigate to result page with score
    navigate(`/employee/final-exam-result/${courseId}`, {
      state: { score, passed, answers }
    });
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const progress = (answeredCount / mockFinalExam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🏆 {mockFinalExam.title}</h1>
              <p className="text-sm opacity-90">{mockFinalExam.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
              <div className="text-sm opacity-90">Thời gian còn lại</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Tiến độ: {answeredCount}/{mockFinalExam.questions.length} câu</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Question Number */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Câu hỏi {currentQuestion + 1} / {mockFinalExam.questions.length}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              answers[currentQuestion] !== -1 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {answers[currentQuestion] !== -1 ? '✓ Đã trả lời' : 'Chưa trả lời'}
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {mockFinalExam.questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {mockFinalExam.questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === idx
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === idx
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === idx && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            <div className="flex gap-2">
              {currentQuestion === mockFinalExam.questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
                >
                  Nộp bài
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Câu tiếp →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-10 gap-2">
            {mockFinalExam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                  currentQuestion === idx
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                    : answers[idx] !== -1
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-2">
              Bạn đã trả lời {answeredCount}/{mockFinalExam.questions.length} câu hỏi.
            </p>
            {answeredCount < mockFinalExam.questions.length && (
              <p className="text-orange-600 mb-4">
                ⚠️ Còn {mockFinalExam.questions.length - answeredCount} câu chưa trả lời!
              </p>
            )}
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn nộp bài không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
