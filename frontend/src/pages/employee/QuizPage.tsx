import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../stores/quiz.store';
import { useAuthStore } from '../../stores/auth.store';
import { QuizDto, QuizQuestionDto, QuizAttemptDto } from '../../api/quiz.api';

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentQuiz, 
    currentAttempt,
    attempts, 
    loading, 
    error,
    fetchQuizById, 
    fetchQuizAttempts,
    startQuizAttempt,
    submitQuizAttempt,
    resetQuiz 
  } = useQuizStore();
  
  const numericQuizId = Number(quizId) || 0;
  const userId = user?.id || 1;
  const enrollmentId = null; // Enrollment ID not required for quiz attempts
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [localQuiz, setLocalQuiz] = useState<QuizDto | null>(null);
  const [localAttempts, setLocalAttempts] = useState<QuizAttemptDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const attemptStartedRef = useRef(false);

  // Fetch quiz data on mount
  useEffect(() => {
    if (numericQuizId && userId) {
      fetchQuizById(numericQuizId, userId);
      fetchQuizAttempts(userId, numericQuizId);
    }
    
    return () => {
      resetQuiz();
    };
  }, [numericQuizId, userId, fetchQuizById, fetchQuizAttempts, resetQuiz]);

  // Update local state when quiz data changes
  useEffect(() => {
    if (currentQuiz) {
      setLocalQuiz(currentQuiz);
      setAnswers(new Array(currentQuiz.questions?.length || 0).fill(-1));
      setTimeLeft((currentQuiz.durationMinutes || 15) * 60);
      
      // Check if user has already passed this quiz - allow them to see results first
      const hasPassed = attempts.some((a: QuizAttemptDto) => a.passed);
      if (hasPassed && isSubmitted) {
        // User has passed and submitted - they can see results
        // But don't start a new attempt
        return;
      }
      
      // Check if max attempts reached (but allow viewing results if just submitted)
      if (attempts.length >= currentQuiz.maxAttempts && !isSubmitted) {
        setMaxAttemptsReached(true);
        return;
      }
      
      // Start quiz attempt when quiz is loaded (only once)
      if (!attemptStartedRef.current && !currentAttempt && !isSubmitted && !submitting) {
        attemptStartedRef.current = true;
        startQuizAttempt(numericQuizId, userId, enrollmentId).catch(err => {
          console.log('Failed to start quiz attempt:', err);
          attemptStartedRef.current = false; // Reset on error to allow retry
        });
      }
    }
  }, [currentQuiz, currentAttempt, isSubmitted, submitting, numericQuizId, userId, enrollmentId, attempts]);

  // Update local attempts when attempts change
  useEffect(() => {
    if (attempts.length > 0) {
      setLocalAttempts(attempts);
    }
    // Check if max attempts reached
    if (localQuiz && attempts.length >= localQuiz.maxAttempts) {
      setMaxAttemptsReached(true);
    }
  }, [attempts, localQuiz]);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || !localQuiz) return;

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
  }, [timeLeft, isSubmitted, localQuiz]);

  // Loading state
  if (loading && !localQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  // Max attempts reached or already passed - only lock when trying to start new attempt
  const hasPassed = localAttempts.some((a: QuizAttemptDto) => a.passed);
  // Only show locked state if user is not viewing their results and has exhausted all attempts
  const shouldLock = (maxAttemptsReached || hasPassed) && !isSubmitted;
  
  if (shouldLock && localQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">{hasPassed ? '🎉' : '🔒'}</div>
          <h2 className="text-2xl font-bold mb-4">
            {hasPassed ? 'Bạn đã hoàn thành quiz!' : 'Bạn đã hết lượt làm bài'}
          </h2>
          <p className="text-gray-600 mb-4">
            {hasPassed 
              ? `Chúc mừng! Bạn đã vượt qua quiz "${localQuiz.title}"`
              : `Bạn đã sử dụng hết ${localQuiz.maxAttempts} lượt làm bài quiz "${localQuiz.title}"`
            }
          </p>
          <div className="mb-6">
            <div className="text-gray-600">Số lượt đã làm: {localAttempts.length}/{localQuiz.maxAttempts}</div>
          </div>
          <button 
            onClick={() => navigate(`/employee/course/${localQuiz.courseId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !localQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Lỗi khi tải quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/employee/my-courses')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  // No quiz found
  if (!localQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy quiz</h2>
          <button 
            onClick={() => navigate('/employee/my-courses')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  const questions = localQuiz.questions || [];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    console.log(newAnswers);
  };

  const handleSubmit = async () => {
    if (!currentAttempt) {
      console.log('No attempt started, cannot submit');
      return;
    }
    
    setSubmitting(true);
    
    // Calculate score and prepare answers for API
    let correct = 0;
    const quizAnswers = questions.map((q: QuizQuestionDto, idx: number) => {
      const selectedAnswer = answers[idx];
      const isCorrect = selectedAnswer === q.correctAnswerIndex;
      if (isCorrect) correct++;
      
      return {
        questionId: q.id,
        selectedAnswerIndex: selectedAnswer,
        isCorrect: isCorrect,
        marksObtained: isCorrect ? q.marks : 0
      };
    });
    
    const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    
    // Calculate time taken in minutes
    const totalTime = (localQuiz?.durationMinutes || 15) * 60;
    // Calculate time taken, ensure at least 1 minute
    const timeTakenSeconds = totalTime - timeLeft;
    const timeTakenMinutes = Math.max(1, Math.round(timeTakenSeconds / 60));
    
    try {
      // Submit quiz attempt to API
      const result = await submitQuizAttempt(currentAttempt.id, quizAnswers, timeTakenMinutes);
      
      // Use score from API if available, otherwise use local calculation
      if (result?.score !== undefined) {
        setScore(result.score);
      } else {
        setScore(finalScore);
      }
      setIsSubmitted(true);
      console.log('Quiz submitted successfully:', result);
      
      // Refresh attempts list
      fetchQuizAttempts(userId, numericQuizId);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Still show the result even if API fails
      setScore(finalScore);
      setIsSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    navigate(`/employee/course/${localQuiz.courseId}`);
  };

  if (isSubmitted) {
    const passingScore = localQuiz.passingScore || 70;
    const passed = score >= passingScore;
    
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
                Điểm qua: {passingScore}%
              </div>
              <div className="text-gray-600">
                Số câu đúng: {answers.filter((a, idx) => a === questions[idx]?.correctAnswerIndex).length}/{questions.length}
              </div>
            </div>

            {/* Review Answers */}
            <div className="text-left mb-6 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-4">Xem lại đáp án:</h3>
              {questions.map((q: QuizQuestionDto, idx: number) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.correctAnswerIndex;
                const isUnanswered = userAnswer === -1 || userAnswer === undefined || userAnswer === null;
                
                return (
                  <div key={q.id} className={`mb-4 p-4 rounded ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="font-medium mb-2">
                      Câu {idx + 1}: {q.questionText}
                      {isUnanswered && <span className="ml-2 text-red-500 text-sm">(Chưa trả lời)</span>}
                    </div>
                    <div className="text-sm space-y-1">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div 
                          key={optIdx}
                          className={`p-2 rounded ${
                            optIdx === q.correctAnswerIndex ? 'bg-green-200 font-medium' :
                            optIdx === userAnswer && !isCorrect ? 'bg-red-200' :
                            'bg-white'
                          }`}
                        >
                          {optIdx === q.correctAnswerIndex && '✓ '}
                          {optIdx === userAnswer && optIdx !== q.correctAnswerIndex && '✗ '}
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
              {!passed && localAttempts.length < (localQuiz.maxAttempts || 3) && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Làm lại ({localAttempts.length + 1}/{localQuiz.maxAttempts || 3})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.filter(a => a !== -1).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold">{localQuiz.title}</h1>
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* Progress Bar - shows answered questions count */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${answeredCount > 0 ? (answeredCount / questions.length) * 100 : progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Câu hỏi {currentQuestion + 1}</div>
            <h2 className="text-xl font-semibold">{questions[currentQuestion]?.questionText}</h2>
          </div>

          <div className="space-y-3">
            {questions[currentQuestion]?.options?.map((option: string, idx: number) => (
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
              Đã trả lời: {answeredCount}/{questions.length}
            </div>

            {/* Show "Nộp bài" when all questions are answered, otherwise show "Câu sau" */}
            {answeredCount === questions.length ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={currentQuestion >= questions.length - 1}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Câu sau →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_q: QuizQuestionDto, idx: number) => (
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
