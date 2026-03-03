import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockQuizzes, mockQuizAttempts } from '../../mocks/quiz.mock';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const quiz = mockQuizzes.find(q => q.id === Number(quizId));
  const attempts = mockQuizAttempts.filter(a => a.quizId === Number(quizId));
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz?.questions.length || 0).fill(-1));
  const [timeLeft, setTimeLeft] = useState((quiz?.duration || 15) * 60); // Convert to seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  if (!quiz) {
    return <div className="p-6">Không tìm thấy quiz</div>;
  }

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

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / quiz.questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    navigate(`/employee/course/${quiz.courseId}`);
  };

  if (isSubmitted) {
    const passed = score >= quiz.passingScore;
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className={`text-6xl mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? '🎉' : '😔'}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Chúc mừng! Bạn đã vượt qua!' : 'Chưa đạt yêu cầu'}
            </h2>
            
            <div className="text-5xl font-bold my-6">
              <span className={passed ? 'text-green-600' : 'text-red-600'}>
                {score}%
              </span>
            </div>

            <div className="mb-6">
              <div className="text-gray-600 mb-2">
                Điểm qua: {quiz.passingScore}%
              </div>
              <div className="text-gray-600">
                Số câu đúng: {answers.filter((a, idx) => a === quiz.questions[idx].correctAnswer).length}/{quiz.questions.length}
              </div>
            </div>

            {/* Review Answers */}
            <div className="text-left mb-6 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-4">Xem lại đáp án:</h3>
              {quiz.questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correctAnswer;
                return (
                  <div key={q.id} className={`mb-4 p-4 rounded ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="font-medium mb-2">
                      Câu {idx + 1}: {q.question}
                    </div>
                    <div className="text-sm space-y-1">
                      {q.options.map((opt, optIdx) => (
                        <div 
                          key={optIdx}
                          className={`p-2 rounded ${
                            optIdx === q.correctAnswer ? 'bg-green-200 font-medium' :
                            optIdx === answers[idx] && !isCorrect ? 'bg-red-200' :
                            'bg-white'
                          }`}
                        >
                          {optIdx === q.correctAnswer && '✓ '}
                          {optIdx === answers[idx] && optIdx !== q.correctAnswer && '✗ '}
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Quay lại khóa học
              </button>
              {!passed && attempts.length < quiz.maxAttempts && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Làm lại ({attempts.length + 1}/{quiz.maxAttempts})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== -1).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {currentQuestion + 1}/{quiz.questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Câu hỏi {currentQuestion + 1}</div>
            <h2 className="text-xl font-semibold">{quiz.questions[currentQuestion].question}</h2>
          </div>

          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === idx
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === idx
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === idx && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            <div className="text-sm text-gray-600">
              Đã trả lời: {answeredCount}/{quiz.questions.length}
            </div>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Câu sau →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answeredCount < quiz.questions.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg font-medium transition-all ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[idx] !== -1
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
