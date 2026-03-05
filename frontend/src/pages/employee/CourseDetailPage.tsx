import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCourses } from '../../data/mockCourses';
import { mockCourseModules, mockTests, mockTestAttempts, mockFinalExam } from '../../mocks/quiz.mock';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const course = mockCourses.find(c => c.id === Number(courseId));
  const modules = mockCourseModules.filter(m => m.courseId === Number(courseId));
  const tests = mockTests.filter(t => t.courseId === Number(courseId));
  const [selectedTab, setSelectedTab] = useState<'overview' | 'modules' | 'tests' | 'progress'>('overview');

  if (!course) {
    return <div className="p-6">Không tìm thấy khóa học</div>;
  }

  // Calculate test completion
  const passedTests = mockTestAttempts.filter(a => a.passed && tests.some(t => t.id === a.testId)).length;
  const certificateEarned = passedTests >= 2; // Pass 2/3 tests
  const finalExamUnlocked = certificateEarned;

  const handleDownload = (url: string, title: string) => {
    alert(`Đang tải xuống: ${title}`);
    console.log('Download:', url);
  };

  const handleStartTest = (testId: number) => {
    navigate(`/employee/test/${testId}`);
  };

  const handleStartFinalExam = () => {
    if (finalExamUnlocked) {
      navigate(`/employee/final-exam/${course.id}`);
    }
  };

  const getTestStatus = (testId: number) => {
    const attempts = mockTestAttempts.filter(a => a.testId === testId);
    if (attempts.length === 0) return { status: 'not-started', text: 'Chưa làm', color: 'bg-gray-200 text-gray-700' };
    
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt.passed) return { status: 'passed', text: 'Đã đạt', color: 'bg-green-100 text-green-700' };
    
    const test = tests.find(t => t.id === testId);
    if (attempts.length >= (test?.maxAttempts || 3)) return { status: 'failed', text: 'Hết lượt', color: 'bg-red-100 text-red-700' };
    
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
              Nội dung học
            </button>
            <button
              onClick={() => setSelectedTab('tests')}
              className={`py-4 border-b-2 transition-colors ${
                selectedTab === 'tests'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Bài kiểm tra
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
                      <div className="font-medium">Học theo module</div>
                      <div className="text-sm text-gray-600">{modules.length} modules với tài liệu và video</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">3 bài test đánh giá</div>
                      <div className="text-sm text-gray-600">Mỗi bài có 3 lần làm tối đa</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Chứng chỉ hoàn thành</div>
                      <div className="text-sm text-gray-600">Đạt 2/3 bài test để nhận chứng chỉ</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Bài thi cuối khóa</div>
                      <div className="text-sm text-gray-600">Mở khóa sau khi nhận chứng chỉ</div>
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
                    <span className="text-gray-600">Số modules:</span>
                    <span className="font-medium">{modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bài test:</span>
                    <span className="font-medium">{tests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đã đạt:</span>
                    <span className="font-medium">{passedTests}/{tests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm đạt:</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lần làm:</span>
                    <span className="font-medium">3 lần/bài</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-2">📌 Lưu ý quan trọng</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Mỗi bài test có 3 lần làm tối đa</li>
                    <li>• Cần đạt 2/3 bài test để nhận chứng chỉ</li>
                    <li>• Final exam mở sau khi có chứng chỉ</li>
                    <li>• Tài liệu có thể tải về để học offline</li>
                  </ul>
                </div>
              </div>

              {certificateEarned && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-2">🎉 Chúc mừng!</div>
                    <p className="text-xs">Bạn đã đạt chứng chỉ khóa học. Bây giờ có thể thi final exam!</p>
                  </div>
                </div>
              )}
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
                      <h3 className="text-lg font-bold">{module.title}</h3>
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
                  {/* Documents */}
                  {module.documents.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        📄 Tài liệu học tập
                      </h4>
                      <div className="space-y-2">
                        {module.documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {doc.type === 'PDF' ? '📕' : doc.type === 'DOCX' ? '📘' : '📙'}
                              </span>
                              <div>
                                <div className="font-medium text-sm">{doc.title}</div>
                                <div className="text-xs text-gray-500">{doc.type} • {doc.size}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(doc.url, doc.title)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              ⬇️ Tải xuống
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {module.videos.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        🎥 Video bài giảng
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {module.videos.map(video => (
                          <div key={video.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                            <div className="bg-gray-200 aspect-video flex items-center justify-center">
                              <span className="text-4xl">▶️</span>
                            </div>
                            <div className="p-3">
                              <div className="font-medium text-sm mb-1">{video.title}</div>
                              <div className="text-xs text-gray-500">⏱️ {video.duration}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quizzes */}
                  {module.quizzes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        📝 Quiz kiểm tra
                      </h4>
                      <div className="space-y-3">
                        {module.quizzes.map(quiz => (
                          <div key={quiz.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{quiz.title}</div>
                                <div className="text-sm text-gray-600">{quiz.description}</div>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                Làm quiz
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'tests' && (
          <div className="space-y-6">
            {/* 3 Main Tests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Bài kiểm tra đánh giá</h2>
              <p className="text-gray-600 mb-6">Hoàn thành 2/3 bài test để nhận chứng chỉ khóa học</p>
              
              <div className="space-y-4">
                {tests.map((test, idx) => {
                  const status = getTestStatus(test.id);
                  const attempts = mockTestAttempts.filter(a => a.testId === test.id);
                  const canRetake = attempts.length < test.maxAttempts && !attempts.some(a => a.passed);

                  return (
                    <div key={test.id} className="border-2 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{idx === 0 ? '📗' : idx === 1 ? '📘' : '📙'}</span>
                            <h3 className="font-bold text-lg">{test.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>⏱️ {test.duration} phút</span>
                            <span>📊 Điểm đạt: {test.passingScore}%</span>
                            <span>🔄 Tối đa {test.maxAttempts} lần</span>
                            <span>📝 {test.questions.length} câu hỏi</span>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      {attempts.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="font-medium text-sm mb-2">Lịch sử làm bài:</div>
                          {attempts.map((attempt, idx) => (
                            <div key={attempt.id} className="flex justify-between text-sm mb-1">
                              <span>Lần {idx + 1}:</span>
                              <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-red-600'}>
                                {attempt.score}% {attempt.passed ? '✓ Đạt' : '✗ Chưa đạt'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleStartTest(test.id)}
                        disabled={!canRetake && attempts.length > 0 && !attempts.some(a => a.passed)}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          canRetake || attempts.length === 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {attempts.length === 0 ? 'Bắt đầu làm bài' : 
                         attempts.some(a => a.passed) ? 'Xem lại kết quả' :
                         canRetake ? 'Làm lại' : 'Đã hết lượt'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Exam */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      🏆 {mockFinalExam.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{mockFinalExam.description}</p>
                  </div>
                  {!finalExamUnlocked && (
                    <span className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      🔒 Đã khóa
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {finalExamUnlocked ? (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-800 font-medium">
                        ✓ Bạn đã đủ điều kiện tham gia bài thi cuối khóa!
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600 mb-6">
                      <span>⏱️ {mockFinalExam.duration} phút</span>
                      <span>📊 Điểm đạt: {mockFinalExam.passingScore}%</span>
                      <span>📝 {mockFinalExam.questions.length} câu hỏi</span>
                    </div>
                    <button
                      onClick={handleStartFinalExam}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-lg"
                    >
                      Bắt đầu Bài thi cuối khóa 🚀
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🔒</div>
                    <div className="text-gray-700 font-medium mb-2">
                      Hoàn thành 2/3 bài test để mở khóa bài thi cuối
                    </div>
                    <div className="text-sm text-gray-500">
                      Tiến độ hiện tại: {passedTests}/{tests.length} bài test đã đạt
                    </div>
                    {!certificateEarned && (
                      <div className="mt-4 text-sm text-orange-600">
                        💡 Bạn cần đạt thêm {2 - passedTests} bài test nữa
                      </div>
                    )}
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
                <div className="text-gray-600 text-sm mb-1">Modules hoàn thành</div>
                <div className="text-2xl font-bold text-green-600">
                  {modules.filter(m => m.completed).length}/{modules.length}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Bài test đã đạt</div>
                <div className="text-2xl font-bold text-blue-600">{passedTests}/{tests.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Trạng thái</div>
                <div className="text-lg font-bold text-orange-600">
                  {certificateEarned ? '🏆 Đã có chứng chỉ' : '📚 Đang học'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Chi tiết bài test</h3>
              <div className="space-y-3">
                {tests.map(test => {
                  const attempts = mockTestAttempts.filter(a => a.testId === test.id);
                  const bestScore = attempts.length > 0 
                    ? Math.max(...attempts.map(a => a.score))
                    : 0;
                  const passed = attempts.some(a => a.passed);
                  
                  return (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{test.title}</div>
                          <div className="text-sm text-gray-600">
                            {attempts.length > 0 ? `${attempts.length} lần làm` : 'Chưa làm'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            passed ? 'text-green-600' : bestScore > 0 ? 'text-orange-600' : 'text-gray-400'
                          }`}>
                            {bestScore > 0 ? `${bestScore}%` : '--'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {passed ? '✓ Đã đạt' : bestScore > 0 ? 'Chưa đạt' : 'Chưa làm'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
