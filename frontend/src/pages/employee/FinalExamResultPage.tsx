import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { mockFinalExam } from '../../mocks/quiz.mock';

export default function FinalExamResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { score, passed, answers } = location.state || { score: 0, passed: false, answers: [] };

  const correctCount = mockFinalExam.questions.filter((q, idx) => answers[idx] === q.correctAnswer).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Result Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-6 ${
          passed 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-pink-600'
        } text-white`}>
          <div className="text-center">
            <div className="mb-4">
              {passed ? (
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              {passed 
                ? 'Bạn đã hoàn thành xuất sắc bài thi cuối khóa!' 
                : 'Đừng nản lòng, hãy ôn tập và thử lại!'}
            </p>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-6 inline-block">
              <div className="text-5xl font-bold mb-2">{score}%</div>
              <div className="text-sm opacity-90">Điểm của bạn</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Tổng số câu</div>
            <div className="text-3xl font-bold text-gray-900">{mockFinalExam.questions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Trả lời đúng</div>
            <div className="text-3xl font-bold text-green-600">{correctCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Điểm đạt</div>
            <div className="text-3xl font-bold text-blue-600">{mockFinalExam.passingScore}%</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết bài làm</h2>
          <div className="space-y-4">
            {mockFinalExam.questions.map((question, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={idx} className={`border-l-4 p-4 rounded ${
                  isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium">Câu {idx + 1}: {question.question}</div>
                    <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isCorrect ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đúng
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Sai
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {question.options.map((option, optIdx) => (
                      <div 
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          optIdx === question.correctAnswer
                            ? 'bg-green-100 border border-green-300'
                            : optIdx === userAnswer && !isCorrect
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {optIdx === question.correctAnswer && (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {optIdx === userAnswer && !isCorrect && (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>{option}</span>
                          {optIdx === question.correctAnswer && (
                            <span className="ml-auto text-xs text-green-600 font-medium">Đáp án đúng</span>
                          )}
                          {optIdx === userAnswer && !isCorrect && (
                            <span className="ml-auto text-xs text-red-600 font-medium">Bạn chọn</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/employee/course/${courseId}`)}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Quay lại khóa học
          </button>
          {passed && (
            <button
              onClick={() => navigate('/employee/certificates')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Xem chứng chỉ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
