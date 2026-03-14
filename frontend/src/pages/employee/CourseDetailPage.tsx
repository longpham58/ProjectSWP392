import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTestAttempts, mockFinalExam } from '../../mocks/quiz.mock';
import { useCourseStore } from '../../stores/course.store';
import { useQuizStore } from '../../stores/quiz.store';
import { useAuthStore } from '../../stores/auth.store';
import { useModuleProgressStore } from '../../stores/moduleProgress.store';
import { feedbackApi, FeedbackDto } from '../../api/feedback.api';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'modules' | 'tests' | 'progress' | 'feedback'>('overview');
  
  const { currentCourse: course, modules, loading, fetchCourseDetail } = useCourseStore();
  const { fetchCourseQuizStatus, courseQuizStatus } = useQuizStore();
  const { fetchModuleProgress, moduleProgress } = useModuleProgressStore();
  
  // Feedback state
  const [courseFeedback, setCourseFeedback] = useState<FeedbackDto[]>([]);
  const [userFeedback, setUserFeedback] = useState<FeedbackDto | null>(null);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    courseRating: 5,
    trainerRating: 5,
    contentRating: 5,
    comments: '',
    suggestions: '',
    wouldRecommend: true,
    isAnonymous: false,
  });
  useEffect(() => {
    if (courseId && user?.id) {
      fetchCourseDetail(Number(courseId));
      fetchCourseQuizStatus(Number(courseId), user.id);
      fetchModuleProgress(user.id, Number(courseId));
      // Fetch feedback
      fetchFeedbackData();
    }
  }, [courseId, user?.id, fetchCourseDetail, fetchCourseQuizStatus]);

  const fetchFeedbackData = async () => {
    if (!courseId || !user?.id) return;
    setFeedbackLoading(true);
    try {
      const [courseRes, userRes, existsRes] = await Promise.all([
        feedbackApi.getCourseFeedback(Number(courseId)),
        feedbackApi.getUserFeedback(user.id, Number(courseId)),
        feedbackApi.hasUserSubmittedFeedback(user.id, Number(courseId)),
      ]);
      setCourseFeedback(courseRes.data.data || []);
      setUserFeedback(userRes.data.data || null);
      setHasSubmittedFeedback(existsRes.data.data || false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };
  // Get tests from courseQuizStatus API
  const tests = courseQuizStatus?.quizzes?.filter((q: any) => q.courseId && !q.moduleId) || [];
  
  if (loading && !courseQuizStatus) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course && !courseQuizStatus) {
    return <div className="p-6">Đang tải...</div>;
  }

  // Use courseQuizStatus data - this is the main source of truth from API
  const completedModulesCount = courseQuizStatus?.completedModulesCount ?? 0;
  const totalModules = courseQuizStatus?.totalModules ?? modules?.length ?? 0;
  const courseProgress = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;
  
  // Test unlock logic: use API data (tests unlock based on required modules in backend)
  const testsUnlocked = (courseQuizStatus?.unlockedQuizCount ?? 0) > 0;

  // Get dynamic test info from API
  const testPassingScore = courseQuizStatus?.testPassingScore ?? 70;
  const testMaxAttempts = courseQuizStatus?.testMaxAttempts ?? 3;
  const requiredPassCount = courseQuizStatus?.requiredPassCount ?? 1;

  // Get passed tests and certificate status from API
  const passedTests = courseQuizStatus?.passedTests ?? 0;
  const certificateEarned = courseQuizStatus?.certificateEarned ?? false;

  // Final exam unlocks after earning certificate
  const finalExamUnlocked = courseQuizStatus?.finalExamUnlocked ?? false;

  // Filter materials into documents and videos (backend returns materials as single list with type)
  const getModuleDocuments = (module: any) => {
    
    // Documents include: PDF, DOCX, PPTX, LINK, DOCUMENT, SLIDE, OTHER
    return module.materials?.filter((m: any) => 
      ['PDF', 'DOCUMENT', 'DOCX', 'SLIDE', 'PPTX', 'LINK', 'OTHER'].includes(m.type)
    ) || module.documents || [];
  };
  const getModuleVideos = (module: any) => {
    
    // Check both materials array and direct videos array for compatibility
    // Videos include: VIDEO, AUDIO
    return module.materials?.filter((m: any) => 
      ['VIDEO', 'AUDIO'].includes(m.type)
    ) || module.videos || [];
  };

  // Check if module is completed - use API data
  const isModuleCompleted = (moduleId: number) => {
    // Use courseQuizStatus to check if module is completed
    // For now, we'll check if the quiz is unlocked to determine if module is completed
    return moduleProgress?.some((mp: any) => mp.moduleId === moduleId && mp.isCompleted);
  };

  const handleDownload = (url: string, title: string) => {
    alert(`Đang tải xuống: ${title}`);
    console.log('Download:', url);
  };

  const handleStartTest = (testId: number) => {
    navigate(`/employee/test/${testId}`);
  };

  const handleStartFinalExam = () => {
    if (finalExamUnlocked && course) {
      navigate(`/employee/final-exam/${course.id}`);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!courseId || !user?.id) return;
    try {
      await feedbackApi.submitFeedback({
        courseId: Number(courseId),
        userId: user.id,
        ...feedbackForm,
        overallRating: Math.round((feedbackForm.courseRating + feedbackForm.trainerRating + feedbackForm.contentRating) / 3),
      });
      setShowFeedbackForm(false);
      fetchFeedbackData();
      alert('Cảm ơn bạn đã đánh giá khóa học!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Có lỗi khi gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const getTestStatus = (testId: number) => {
    // Get test info from courseQuizStatus
    const test = tests.find((t: any) => t.id === testId);
    
    // Check if tests are unlocked - use API data
    const isUnlockedFromApi = test?.isUnlocked;
    
    if (isUnlockedFromApi === false) {
      return { status: 'locked', text: '🔒 Chưa mở khóa', color: 'bg-gray-200 text-gray-700' };
    }
    if (!testsUnlocked && isUnlockedFromApi === undefined) {
      return { status: 'locked', text: '🔒 Chưa mở khóa', color: 'bg-gray-200 text-gray-700' };
    }
    
    // Check if passed from API data
    if (test?.hasPassed) {
      return { status: 'passed', text: 'Đã đạt', color: 'bg-green-100 text-green-700' };
    }
    
    // Check attempts from API
    const attemptsCount = test?.attemptsCount || 0;
    if (attemptsCount === 0) return { status: 'not-started', text: 'Chưa làm', color: 'bg-gray-200 text-gray-700' };
    
    if (attemptsCount >= (test?.maxAttempts || 3)) return { status: 'failed', text: 'Hết lượt', color: 'bg-red-100 text-red-700' };
    
    return { status: 'in-progress', text: `Lần ${attemptsCount}/${test?.maxAttempts || 3}`, color: 'bg-yellow-100 text-yellow-700' };
  };

  const currentCourse = course || {
    id: Number(courseId),
    title: 'Course',
    description: '',
    instructor: '',
    duration: '',
    progress: courseProgress
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
          <h1 className="text-3xl font-bold mb-2">{currentCourse.title}</h1>
          <p className="text-blue-100 mb-4">{currentCourse.description}</p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="opacity-75">Giảng viên:</span>
              <span className="ml-2 font-medium">{currentCourse.instructor}</span>
            </div>
            <div>
              <span className="opacity-75">Thời lượng:</span>
              <span className="ml-2 font-medium">{currentCourse.duration}</span>
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
            <button
              onClick={() => setSelectedTab('feedback')}
              className={`py-4 border-b-2 transition-colors ${
                selectedTab === 'feedback'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Đánh giá
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
                <p className="text-gray-700 mb-4">{currentCourse.description}</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <div className="font-medium">Học theo module</div>
                      <div className="text-sm text-gray-600">{totalModules} modules với tài liệu và video</div>
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
                    <span className="font-medium">{totalModules}</span>
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
                  : `Hoàn thành ${completedModulesCount}/${totalModules} module để mở khóa bài test`
                }
              </p>
              
              <div className="space-y-4">
                {tests.map((test: any, idx: number) => {
                  console.log('Test from API:', test);
                  const status = getTestStatus(test.id);
                  const attempts = mockTestAttempts.filter(a => a.testId === test.id);
                  const canRetake = attempts.length < test.maxAttempts && !attempts.some(a => a.passed);

                  // Get required modules info
                  const requiredModules = test.requiredModuleTitles || [];

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
                            <span>⏱️ {test.durationMinutes} phút</span>
                            <span>📊 Điểm đạt: {test.passingScore}%</span>
                            <span>🔄 Tối đa {test.maxAttempts} lần</span>
                            <span>📝 {test.questions?.length || 0} câu hỏi</span>
                          </div>
                          {/* Show required modules to unlock */}
                          {requiredModules.length > 0 && (
                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                              🔑 Yêu cầu hoàn thành: {requiredModules.join(', ')}
                            </div>
                          )}
                          {requiredModules.length === 0 && test.isUnlocked === undefined && (
                            <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                              ✅ Mở khóa sẵn
                            </div>
                          )}
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
                        disabled={(!testsUnlocked && test.isUnlocked === undefined) || (!test.isUnlocked && test.isUnlocked !== undefined) || (!canRetake && attempts.length > 0 && !attempts.some((a: any) => a.passed))}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          (testsUnlocked || test.isUnlocked) && (canRetake || attempts.length === 0)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!testsUnlocked && test.isUnlocked === undefined ? '🔒 Chưa mở khóa' :
                         test.isUnlocked === false ? '🔒 Chưa mở khóa' :
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
                  {completedModulesCount}/{totalModules}
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
                {tests.map((test: any) => {
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

        {selectedTab === 'feedback' && (
          <div className="space-y-6">
            {/* Feedback Form / Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Đánh giá khóa học</h2>
                {!hasSubmittedFeedback && !showFeedbackForm && (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Viết đánh giá
                  </button>
                )}
                {hasSubmittedFeedback && (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    ✓ Bạn đã đánh giá
                  </span>
                )}
              </div>

              {showFeedbackForm && !hasSubmittedFeedback && (
                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div>
                    <label className="block font-medium mb-2">Đánh giá khóa học</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackForm({ ...feedbackForm, courseRating: star })}
                          className={`text-2xl ${star <= feedbackForm.courseRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Đánh giá giảng viên</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                          className={`text-2xl ${star <= feedbackForm.trainerRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Đánh giá nội dung</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackForm({ ...feedbackForm, contentRating: star })}
                          className={`text-2xl ${star <= feedbackForm.contentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Nhận xét</label>
                    <textarea
                      value={feedbackForm.comments}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                      className="w-full border rounded-lg p-3 h-24"
                      placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Đề xuất (không bắt buộc)</label>
                    <textarea
                      value={feedbackForm.suggestions}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                      className="w-full border rounded-lg p-3 h-24"
                      placeholder="Đề xuất cải thiện..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={feedbackForm.wouldRecommend}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, wouldRecommend: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Sẽ giới thiệu cho bạn bè
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={feedbackForm.isAnonymous}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, isAnonymous: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Đánh giá ẩn danh
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmitFeedback}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Gửi đánh giá
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {hasSubmittedFeedback && userFeedback && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">Cảm ơn đánh giá của bạn!</div>
                  <div className="text-sm text-gray-600">
                    Điểm trung bình: {userFeedback.overallRating}/5
                  </div>
                </div>
              )}
            </div>

            {/* Course Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Đánh giá từ học viên</h3>
              {feedbackLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : courseFeedback.length > 0 ? (
                <div className="space-y-4">
                  {courseFeedback.map((feedback: any) => (
                    <div key={feedback.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {feedback.isAnonymous ? 'Ẩn danh' : feedback.userName || 'Học viên'}
                        </div>
                        <div className="text-yellow-400">
                          {'★'.repeat(feedback.overallRating || 5)}
                          {'☆'.repeat(5 - (feedback.overallRating || 5))}
                        </div>
                      </div>
                      {feedback.comments && (
                        <p className="text-gray-600 text-sm mb-2">{feedback.comments}</p>
                      )}
                      {feedback.suggestions && (
                        <p className="text-gray-500 text-xs italic">💡 {feedback.suggestions}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
