import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTestAttempts, mockFinalExam, mockTests } from '../../mocks/quiz.mock';
import { useCourseStore } from '../../stores/course.store';
import { useQuizStore } from '../../stores/quiz.store';
import { useModuleProgressStore } from '../../stores/moduleProgress.store';
import { useAuthStore } from '../../stores/auth.store';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'modules' | 'tests' | 'progress'>('overview');
  
  const { currentCourse: course, modules, loading, fetchCourseDetail } = useCourseStore();
  const { quizzes, attempts, fetchQuizzes, fetchQuizAttemptsInCourse } = useQuizStore();
  const { moduleProgress, fetchModuleProgress, completeModule } = useModuleProgressStore();

  useEffect(() => {
    if (courseId && user?.id) {
      fetchCourseDetail(Number(courseId));
      fetchQuizzes(Number(courseId), user.id);
      fetchQuizAttemptsInCourse(user.id, Number(courseId));
      fetchModuleProgress(user.id, Number(courseId));
    }
  }, [courseId, user?.id, fetchCourseDetail, fetchQuizzes, fetchQuizAttemptsInCourse, fetchModuleProgress]);

  // Filter tests: course-level quizzes (PRE_TEST/POST_TEST) - have courseId but no moduleId
  // These are fetched from quizStore
  const tests = quizzes.filter((q: any) => q.courseId && !q.moduleId);
  
  // Module quizzes: PRACTICE type - come from modules data (each module has quizzes array)
  // No need to filter from quiz store - they're in modules[i].quizzes

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="p-6">Không tìm thấy khóa học</div>;
  }

  // Calculate course progress from module progress if not provided
  const courseProgress = course.progress ?? (
    moduleProgress.length > 0 
      ? Math.round(moduleProgress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / moduleProgress.length)
      : 0
  );

  // Count completed modules
  const completedModulesCount = moduleProgress.filter((p: any) => p.isCompleted).length;
  const totalModules = modules.length;

  // Test unlock logic: unlock after completing 1 module
  const modulesRequiredForTest = 1;
  const testsUnlocked = completedModulesCount >= modulesRequiredForTest;

  // Get dynamic test info - calculate from ALL tests
  const testPassingScore = tests.length > 0 
    ? Math.max(...tests.map((t: any) => t.passingScore || 70)) 
    : 70;
  const testMaxAttempts = tests.length > 0 
    ? Math.max(...tests.map((t: any) => t.maxAttempts || 3)) 
    : 3;
  const requiredPassCount = tests.length >= 3 ? 2 : Math.max(1, Math.ceil(tests.length / 2));

  // Calculate passed tests from actual attempts in store
  const passedTests = attempts.filter((a: any) => a.passed || (a.score && a.score >= testPassingScore)).length;
  const certificateEarned = passedTests >= requiredPassCount;

  // Final exam unlocks after passing required number of tests
  const finalExamUnlocked = certificateEarned;

  // Filter materials into documents and videos (backend returns materials as single list with type)
  const getModuleDocuments = (module: any) => {
    console.log('Filtering documents for module:', module.id, 'with materials:', module.materials);
    // Check both materials array and direct documents array for compatibility
    return module.materials?.filter((m: any) => m.type === 'PDF' || m.type === 'DOCX' || m.type === 'PPTX') || module.documents || [];
  };
  const getModuleVideos = (module: any) => {
    console.log('Filtering videos for module:', module.id, 'with materials:', module.materials);
    // Check both materials array and direct videos array for compatibility
    return module.materials?.filter((m: any) => m.type === 'VIDEO') || module.videos || [];
  };

  // Check if module is completed from moduleProgress store
  const isModuleCompleted = (moduleId: number) => {
    const progress = moduleProgress.find((p: any) => p.moduleId === moduleId);
    return progress?.isCompleted || false;
  };

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
    // Check if tests are unlocked first
    if (!testsUnlocked) {
      return { status: 'locked', text: '🔒 Chưa mở khóa', color: 'bg-gray-200 text-gray-700' };
    }
    
    const attemptsForTest = attempts.filter((a: any) => a.quizId === testId || a.testId === testId);
    if (attemptsForTest.length === 0) return { status: 'not-started', text: 'Chưa làm', color: 'bg-gray-200 text-gray-700' };
    
    const lastAttempt = attemptsForTest[attemptsForTest.length - 1];
    const passed = lastAttempt.passed || (lastAttempt.score && lastAttempt.score >= testPassingScore);
    if (passed) return { status: 'passed', text: 'Đã đạt', color: 'bg-green-100 text-green-700' };
    
    const test = tests.find(t => t.id === testId);
    if (attemptsForTest.length >= (test?.maxAttempts || 3)) return { status: 'failed', text: 'Hết lượt', color: 'bg-red-100 text-red-700' };
    
    return { status: 'in-progress', text: `Lần ${attemptsForTest.length}/${test?.maxAttempts || 3}`, color: 'bg-yellow-100 text-yellow-700' };
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
              <span className="ml-2 font-medium">{courseProgress}%</span>
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
                      <div className="font-medium">{tests.length} bài test đánh giá</div>
                      <div className="text-sm text-gray-600">Mỗi bài có {testMaxAttempts} lần làm tối đa</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Chứng chỉ hoàn thành</div>
                      <div className="text-sm text-gray-600">Đạt {requiredPassCount}/{tests.length} bài test để nhận chứng chỉ</div>
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
                    <span className="font-medium">{testPassingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lần làm:</span>
                    <span className="font-medium">{testMaxAttempts} lần/bài</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-2">📌 Lưu ý quan trọng</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Mỗi bài test có {testMaxAttempts} lần làm tối đa</li>
                    <li>• Cần đạt {requiredPassCount}/{tests.length} bài test để nhận chứng chỉ</li>
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
            {modules.map((module: any) => (
              <div key={module.id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    {isModuleCompleted(module.id) && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        ✓ Hoàn thành
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Documents - filter from materials */}
                  {getModuleDocuments(module).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        📄 Tài liệu học tập
                      </h4>
                      <div className="space-y-2">
                        {getModuleDocuments(module).map((doc: any) => (
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

                  {/* Videos - filter from materials */}
                  {getModuleVideos(module).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        🎥 Video bài giảng
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getModuleVideos(module).map((video: any) => (
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
                        {module.quizzes.map((quiz: any) => (
                          <div key={quiz.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{quiz.title}</div>
                                <div className="text-sm text-gray-600">{quiz.description}</div>
                              </div>
                              <button 
                                onClick={() => navigate(`/employee/quiz/${quiz.id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                              >
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
              <p className="text-gray-600 mb-6">
                {testsUnlocked 
                  ? `Hoàn thành ${requiredPassCount}/${tests.length} bài test để nhận chứng chỉ khóa học`
                  : `Hoàn thành ${modulesRequiredForTest} module để mở khóa bài test`
                }
              </p>
              
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
                            <span>📝 {test.questions?.length || 0} câu hỏi</span>
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
                        disabled={!testsUnlocked || (!canRetake && attempts.length > 0 && !attempts.some((a: any) => a.passed))}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          testsUnlocked && (canRetake || attempts.length === 0)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!testsUnlocked ? '🔒 Chưa mở khóa' :
                         attempts.length === 0 ? 'Bắt đầu làm bài' : 
                         attempts.some((a: any) => a.passed) ? 'Xem lại kết quả' :
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
                <span className="font-medium">{courseProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${courseProgress}%` }}
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
