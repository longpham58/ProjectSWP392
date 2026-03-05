import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCourses } from '../../data/mockCourses';
import { mockCourseModules, mockQuizAttempts, mockFinalExam } from '../../mocks/quiz.mock';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const course = mockCourses.find(c => c.id === Number(courseId));
  const modules = mockCourseModules.filter(m => m.courseId === Number(courseId));
  const [selectedTab, setSelectedTab] = useState<'overview' | 'modules' | 'progress'>('overview');

  if (!course) {
    return <div className="p-6">Không tìm thấy khóa học</div>;
  }

  // Calculate quiz completion
  const totalQuizzes = modules.reduce((sum, m) => sum + m.quizzes.length, 0);
  const passedQuizzes = mockQuizAttempts.filter(a => a.passed).length;
  const finalExamUnlocked = passedQuizzes >= Math.ceil(totalQuizzes * 2 / 3);

  const handleStartQuiz = (quizId: number) => {
    navigate(`/employee/quiz/${quizId}`);
  };

  const handleStartFinalExam = () => {
    if (finalExamUnlocked) {
      navigate(`/employee/final-exam/${course.id}`);
    }
  };

  const getQuizStatus = (quizId: number) => {
    const attempts = mockQuizAttempts.filter(a => a.quizId === quizId);
    if (attempts.length === 0) return { status: 'not-started', text: 'Chưa làm', color: 'bg-gray-200 text-gray-700' };
    
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt.passed) return { status: 'passed', text: 'Đã qua', color: 'bg-green-100 text-green-700' };
    
    if (attempts.length >= 3) return { status: 'failed', text: 'Không hoàn thành', color: 'bg-red-100 text-red-700' };
    
    return { status: 'in-progress', text: `Lần ${attempts.length}/3`, color: 'bg-yellow-100 text-yellow-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/employee/my-courses')}
            className="mb-4 text-white hover:underline flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-blue-100 mb-4">{course.description}</p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="opacity-75">Giảng viên:</span>
              <span className="ml-2 font-medium">{course.instructor}</span>
            </div>
            <div>
              <span className="opacity-75">Thời lượng:</span>
              <span className="ml-2 font-medium">{course.duration}</span>
            </div>
            <div>
              <span className="opacity-75">Tiến độ:</span>
              <span className="ml-2 font-medium">{course.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-4 border-b-2 transition-colors ${
                selectedTab === 'overview'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setSelectedTab('modules')}
              className={`py-4 border-b-2 transition-colors ${
                selectedTab === 'modules'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Nội dung khóa học
            </button>
            <button
              onClick={() => setSelectedTab('progress')}
              className={`py-4 border-b-2 transition-colors ${
                selectedTab === 'progress'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tiến độ
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Về khóa học này</h2>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Học theo lộ trình</div>
                      <div className="text-sm text-gray-600">3 modules với quiz đánh giá</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Bài thi cuối khóa</div>
                      <div className="text-sm text-gray-600">Hoàn thành 2/3 quiz để mở khóa</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Chứng chỉ hoàn thành</div>
                      <div className="text-sm text-gray-600">Nhận chứng chỉ khi đạt yêu cầu</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Thông tin khóa học</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng số quiz:</span>
                    <span className="font-medium">{totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đã hoàn thành:</span>
                    <span className="font-medium">{passedQuizzes}/{totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm qua quiz:</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lần làm lại:</span>
                    <span className="font-medium">3 lần</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian chờ:</span>
                    <span className="font-medium">8 giờ</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-2">📌 Lưu ý quan trọng</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Mỗi quiz có 3 lần làm</li>
                    <li>• Cách nhau 8 giờ giữa các lần</li>
                    <li>• Cần 2/3 quiz đạt để thi final</li>
                    <li>• Final exam mở khóa khi đủ điều kiện</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'modules' && (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module.id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    {module.completed && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        ✓ Hoàn thành
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {module.quizzes.map((quiz: any) => {
                      const status = getQuizStatus(quiz.id);
                      const attempts = mockQuizAttempts.filter(a => a.quizId === quiz.id);
                      const canRetake = attempts.length < quiz.maxAttempts && !attempts.some(a => a.passed);

                      return (
                        <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold">{quiz.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>⏱️ {quiz.duration} phút</span>
                                <span>📊 Điểm qua: {quiz.passingScore}%</span>
                                <span>🔄 Tối đa {quiz.maxAttempts} lần</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
                              {status.text}
                            </span>
                          </div>

                          {attempts.length > 0 && (
                            <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                              <div className="font-medium mb-2">Lịch sử làm bài:</div>
                              {attempts.map((attempt, idx) => (
                                <div key={attempt.id} className="flex justify-between text-xs mb-1">
                                  <span>Lần {idx + 1}:</span>
                                  <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {attempt.score}% {attempt.passed ? '✓' : '✗'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            disabled={!canRetake && attempts.length > 0 && !attempts.some(a => a.passed)}
                            className={`w-full py-2 rounded transition-colors ${
                              canRetake || attempts.length === 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {attempts.length === 0 ? 'Bắt đầu Quiz' : 
                             attempts.some(a => a.passed) ? 'Xem lại' :
                             canRetake ? 'Làm lại' : 'Đã hết lượt'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Final Exam */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      🏆 {mockFinalExam.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{mockFinalExam.description}</p>
                  </div>
                  {!finalExamUnlocked && (
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                      🔒 Đã khóa
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {finalExamUnlocked ? (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                      <div className="text-green-800 text-sm">
                        ✓ Bạn đã đủ điều kiện tham gia bài thi cuối khóa!
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span>⏱️ {mockFinalExam.duration} phút</span>
                      <span>📊 Điểm qua: {mockFinalExam.passingScore}%</span>
                      <span>📝 {mockFinalExam.questions.length} câu hỏi</span>
                    </div>
                    <button
                      onClick={handleStartFinalExam}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                    >
                      Bắt đầu Bài thi cuối khóa
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔒</div>
                    <div className="text-gray-600 mb-2">
                      Hoàn thành ít nhất 2/3 quiz để mở khóa bài thi cuối
                    </div>
                    <div className="text-sm text-gray-500">
                      Tiến độ hiện tại: {passedQuizzes}/{totalQuizzes} quiz
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'progress' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Tiến độ học tập</h2>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Tiến độ tổng thể</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Quiz đã hoàn thành</div>
                <div className="text-2xl font-bold text-green-600">{passedQuizzes}/{totalQuizzes}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Điểm trung bình</div>
                <div className="text-2xl font-bold text-blue-600">
                  {mockQuizAttempts.length > 0 
                    ? Math.round(mockQuizAttempts.reduce((sum, a) => sum + a.score, 0) / mockQuizAttempts.length)
                    : 0}%
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Trạng thái</div>
                <div className="text-lg font-bold text-orange-600">Đang học</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Chi tiết từng module</h3>
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{module.title}</div>
                    <div className="space-y-2">
                      {module.quizzes.map((quiz: any) => {
                        const attempts = mockQuizAttempts.filter(a => a.quizId === quiz.id);
                        const bestScore = attempts.length > 0 
                          ? Math.max(...attempts.map(a => a.score))
                          : 0;
                        
                        return (
                          <div key={quiz.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{quiz.title}</span>
                            <span className={`font-medium ${
                              bestScore >= quiz.passingScore ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {attempts.length > 0 ? `${bestScore}%` : 'Chưa làm'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
