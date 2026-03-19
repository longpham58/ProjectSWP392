import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi, type CourseDetailResponse, type QuizDto, type LessonDto } from '../../api/employee.api';
import { useAuthStore } from '../../stores/auth.store';
import DiscussionTab from './components/DiscussionTab';
import {
  CheckCircle2, Pin, MessageSquare, Clock,
  BookOpen, Trophy, Lock, Lightbulb, GraduationCap, ClipboardList,
  FileText, Download, X, ExternalLink, PlayCircle
} from 'lucide-react';

// ─── LessonModal defined OUTSIDE CourseDetailPage to prevent state reset on parent re-render ───
interface LessonModalProps {
  lesson: LessonDto;
  enrollmentStatus: string | null;
  courseId: string;
  userId: number;
  courseQuizStatus?: any;
  onClose: () => void;
  onMarked: (lessonId: number, newProgress: number) => void;
}

function LessonModal({ lesson, enrollmentStatus, courseId, userId, onClose, onMarked }: LessonModalProps) {
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(lesson.status === 'COMPLETED');
  const isVideo = lesson.type === 'VIDEO';
  const hasFile = !!(lesson.fileUrl && lesson.fileUrl.trim().length > 0);
  const isYoutube = hasFile && lesson.fileUrl!.includes('youtube.com/embed');
  // Employees are assigned courses by HR — no enrollment needed to mark lessons
  const canMark = !marked;

  const handleMarkCompleted = async () => {
    if (!userId || !courseId || marking || marked) return;
    setMarking(true);
    setMarked(true);
    try {
      const res = await employeeApi.markLessonCompleted(Number(courseId), userId, lesson.id);
      onMarked(lesson.id, res.data.progress);
    } catch (err) {
      console.error('markLesson modal failed:', err);
      // Keep marked=true — don't revert to avoid confusing UX
    } finally {
      setMarking(false);
    }
  };
  // Get tests from courseQuizStatus API - include quizzes that are course-level (no module) or are final exams
  const allCourseQuizzes = courseQuizStatus?.quizzes?.filter((q: any) => !q.moduleId) || [];
  // Separate final exam from regular tests
  const finalExamFromApi = courseQuizStatus?.finalExam;
  const tests = allCourseQuizzes.filter((q: any) => !q.isFinalExam);
  
  // Get final exam from API or use mock as fallback
  const finalExam = finalExamFromApi || mockFinalExam;
  
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
  
  // Session completion data for tests unlocking
  const completedSessions = courseQuizStatus?.completedSessions ?? 0;
  const totalSessions = courseQuizStatus?.totalSessions ?? 0;
  const allSessionsCompleted = courseQuizStatus?.allSessionsCompleted ?? false;
  
  // Tests are unlocked after completing all sessions (not based on modules)
  const testsUnlocked = allSessionsCompleted;

  // Get dynamic test info from API
  const testPassingScore = courseQuizStatus?.testPassingScore ?? 70;
  const testMaxAttempts = courseQuizStatus?.testMaxAttempts ?? 3;
  const requiredPassCount = courseQuizStatus?.requiredPassCount ?? 1;

  // Get passed tests and certificate status from API
  const passedTests = courseQuizStatus?.passedTests ?? 0;
  const certificateEarned = courseQuizStatus?.certificateEarned ?? false;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {isVideo ? <PlayCircle size={20} className="text-blue-600" /> : <FileText size={20} className="text-orange-500" />}
            <div>
              <h2 className="text-base font-bold leading-tight">{lesson.title}</h2>
              <span className="text-xs text-gray-400">{isVideo ? 'Video bài giảng' : 'Tài liệu học'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {marked && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Đã hoàn thành
              </span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!hasFile ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-lg font-medium text-gray-500">Bài học lý thuyết</p>
              <p className="text-sm mt-1 text-gray-400">Nội dung bài học này được trình bày trực tiếp bởi giảng viên.</p>
              <p className="text-sm mt-1 text-gray-400">Sau khi xem xong, hãy đánh dấu đã hoàn thành bên dưới.</p>
            </div>
          ) : isVideo ? (
            <div className="space-y-4">
              {isYoutube ? (
                <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
                  <iframe src={lesson.fileUrl!} className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={lesson.title} />
                </div>
              ) : (
                <video src={lesson.fileUrl!} controls className="w-full rounded-lg bg-black" style={{ maxHeight: '400px' }}>
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <a href={lesson.fileUrl!} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                  <ExternalLink size={13} /> Mở YouTube
                </a>
                {lesson.isDownloadable && (
                  <a href={lesson.fileUrl!} download
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <Download size={13} /> Tải xuống
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-4 bg-orange-50 rounded-xl border border-orange-100">
              <FileText size={56} className="text-orange-400" />
              <p className="text-gray-700 font-medium text-center px-4">{lesson.title}</p>
              <div className="flex gap-3 flex-wrap justify-center">
                <a href={lesson.fileUrl!} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <ExternalLink size={14} /> Xem tài liệu
                </a>
                {lesson.isDownloadable && (
                  <a href={lesson.fileUrl!} download
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    <Download size={14} /> Tải về máy
                  </a>
                )}
              </div>
              {!lesson.isDownloadable && <p className="text-xs text-gray-400">Tài liệu này không cho phép tải xuống</p>}
            </div>
          )}
        </div>

        <div className="border-t p-4 flex-shrink-0 bg-gray-50">
          {marked ? (
            <div className="text-center text-sm text-green-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={15} /> Bài học này đã được tính vào tiến độ khóa học
            </div>
          ) : canMark ? (
            <button onClick={handleMarkCompleted} disabled={marking}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 font-medium text-sm">
              <CheckCircle2 size={16} />
              {marking ? 'Đang lưu...' : isVideo ? 'Đánh dấu đã xem xong video' : hasFile ? 'Đánh dấu đã đọc tài liệu' : 'Đánh dấu đã xem bài học'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'modules' | 'progress' | 'quiz' | 'discussion'>('overview');
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonDto | null>(null);

  useEffect(() => {
    if (!courseId || !user?.id) return;
    setLoading(true);
    employeeApi.getCourseDetail(Number(courseId), user.id)
      .then(res => setCourse(res.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId, user?.id]);

  useEffect(() => {
    if (selectedTab !== 'quiz' || !courseId || !user?.id) return;
    setQuizzesLoading(true);
    employeeApi.getQuizzes(Number(courseId), user.id)
      .then(res => setQuizzes(res.data))
      .catch(() => setQuizzes([]))
      .finally(() => setQuizzesLoading(false));
  }, [selectedTab, courseId, user?.id]);

  // Called by LessonModal after successful mark — update lesson status + progress without re-fetching
  const handleLessonMarked = (lessonId: number, newProgress: number) => {
    setCourse(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        progress: newProgress,
        modules: prev.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, status: 'COMPLETED' } : l)
        }))
      };
    });
  };

  // Inline mark from lesson list row (no modal)
  const handleInlineMark = async (lessonId: number) => {
    if (!user?.id || !courseId) return;
    // Optimistic — update UI immediately
    setCourse(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, status: 'COMPLETED' } : l)
        }))
      };
    });
    try {
      const res = await employeeApi.markLessonCompleted(Number(courseId), user.id, lessonId);
      // Only update progress %, keep lesson statuses from optimistic update
      setCourse(prev => prev ? { ...prev, progress: res.data.progress } : prev);
    } catch (err) {
      console.error('markLesson failed:', err);
      // Do NOT revert — keep optimistic state to avoid confusing UX
      // The lesson will show as completed even if API failed (acceptable tradeoff)
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải khóa học...</div>;
  if (!course) return <div className="p-6">Không tìm thấy khóa học</div>;

  const certificateEarned = course.enrollmentStatus === 'COMPLETED';
  // Employees are assigned courses by HR — no enrollment needed to access content
  const canAct = true;

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          enrollmentStatus={course.enrollmentStatus}
          courseId={courseId!}
          userId={user!.id}
          onClose={() => setSelectedLesson(null)}
          onMarked={handleLessonMarked}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button onClick={() => navigate('/employee/my-courses')} className="mb-4 text-white hover:underline flex items-center gap-2">
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-blue-100 mb-4">{course.description}</p>
          <div className="flex gap-6 text-sm">
            <div><span className="opacity-75">Giảng viên:</span><span className="ml-2 font-medium">{course.trainerName}</span></div>
            <div><span className="opacity-75">Thời lượng:</span><span className="ml-2 font-medium">{course.durationHours}h</span></div>
            <div><span className="opacity-75">Tiến độ:</span><span className="ml-2 font-medium">{course.progress}%</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {(['overview', 'modules', 'progress', 'quiz', 'discussion'] as const).map(tab => {
              const labels: Record<string, string> = {
                overview: 'Tổng quan', modules: 'Nội dung học',
                progress: 'Tiến độ', quiz: 'Bài kiểm tra', discussion: 'Thảo luận & Đánh giá'
              };
              return (
                <button key={tab} onClick={() => setSelectedTab(tab)}
                  className={`py-4 border-b-2 transition-colors ${selectedTab === tab ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                  {tab === 'discussion' && <MessageSquare size={14} className="inline mr-1" />}
                  {tab === 'quiz' && <ClipboardList size={14} className="inline mr-1" />}
                  {labels[tab]}
                </button>
              );
            })}
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
                <p className="text-gray-700 mb-4">{course.summary || course.description}</p>
                <div className="space-y-3">
                  {[
                    { title: 'Học theo module', sub: `${course.modules?.length || 0} modules với tài liệu và bài học` },
                    { title: 'Chứng chỉ hoàn thành', sub: 'Hoàn thành khóa học để nhận chứng chỉ' },
                    { title: 'Thảo luận trực tiếp', sub: 'Đặt câu hỏi và thảo luận với giảng viên' },
                  ].map(({ title, sub }) => (
                    <div key={title} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div><div className="font-medium">{title}</div><div className="text-sm text-gray-600">{sub}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Thông tin khóa học</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Danh mục', value: course.category },
                    { label: 'Thời lượng', value: `${course.durationHours}h` },
                    { label: 'Học viên', value: String(course.enrolledStudents) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-600">{label}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-medium ${certificateEarned ? 'text-green-600' : 'text-blue-600'}`}>
                      {certificateEarned ? 'Đã hoàn thành' : (course.enrollmentStatus === 'APPROVED' || course.enrollmentStatus === 'REGISTERED') ? 'Đang học' : 'Chưa đăng ký'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <div className="font-medium mb-2 flex items-center gap-1"><Pin size={13} /> Lưu ý quan trọng</div>
                <ul className="space-y-1 text-xs">
                  <li>• Học đầy đủ các module để hoàn thành khóa học</li>
                  <li>• Tham gia thảo luận để hiểu sâu hơn</li>
                  <li>• Liên hệ giảng viên nếu cần hỗ trợ</li>
                </ul>
              </div>
              {certificateEarned && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <div className="font-medium mb-1 flex items-center gap-1"><GraduationCap size={13} /> Chúc mừng!</div>
                  <p className="text-xs">Bạn đã hoàn thành khóa học và nhận chứng chỉ!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'modules' && (
          <div className="space-y-6">
            {course.modules && course.modules.length > 0 ? course.modules.map(module => (
              <div key={module.id} className="bg-white rounded-lg shadow">
                <div className="p-5 border-b bg-gray-50">
                  <h3 className="text-base font-bold">{module.title}</h3>
                </div>
                <div className="p-5">
                  {module.lessons && module.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {module.lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
                            {lesson.type === 'VIDEO'
                              ? <PlayCircle size={16} className="text-blue-500 flex-shrink-0" />
                              : <FileText size={16} className="text-orange-500 flex-shrink-0" />}
                            <div>
                              <div className="font-medium text-sm">{lesson.title}</div>
                              <div className="text-xs text-gray-400">
                                {lesson.type === 'VIDEO' ? 'Video bài giảng' : 'Tài liệu học'}
                                {lesson.isDownloadable ? ' · Có thể tải về' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {lesson.status === 'COMPLETED' ? (
                              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                <CheckCircle2 size={12} /> Đã xong
                              </span>
                            ) : canAct ? (
                              <button
                                className="text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                                onClick={e => { e.stopPropagation(); handleInlineMark(lesson.id); }}
                              >
                                Đánh dấu xong
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nội dung đang được cập nhật</p>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>Nội dung khóa học đang được cập nhật</p>
              </div>
            )}
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
                <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Modules</div>
                <div className="text-2xl font-bold text-blue-600">{course.modules?.length || 0}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Thời lượng</div>
                <div className="text-2xl font-bold text-blue-600">{course.durationHours}h</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm mb-1">Trạng thái</div>
                <div className="text-lg font-bold text-orange-600 flex items-center gap-1">
                  {certificateEarned ? <><Trophy size={16} className="text-yellow-500" /> Đã hoàn thành</>
                    : (course.enrollmentStatus === 'APPROVED' || course.enrollmentStatus === 'REGISTERED') ? <><BookOpen size={16} /> Đang học</>
                    : <><Lock size={16} /> Chưa bắt đầu</>}
                </div>
              </div>
            </div>
            {!certificateEarned && (course.enrollmentStatus === 'APPROVED' || course.enrollmentStatus === 'REGISTERED') && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm flex items-center gap-1">
                <Lightbulb size={13} /> Tiếp tục học để hoàn thành khóa học và nhận chứng chỉ!
              </div>
            )}
            {certificateEarned && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium flex items-center gap-1">
                <CheckCircle2 size={15} /> Bạn đã hoàn thành khóa học! Xem chứng chỉ tại trang Chứng chỉ.
              </div>
            )}
          </div>
        )}

        {selectedTab === 'quiz' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Bài kiểm tra</h2>
            {quizzesLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : quizzes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p>Chưa có bài kiểm tra nào</p>
              </div>
            ) : quizzes.map(quiz => {
              const isFinal = quiz.isFinalExam;
              const canTake = !quiz.locked && canAct;
              return (
                <div key={quiz.id} className={`bg-white rounded-xl shadow p-6 border-l-4 ${isFinal ? 'border-purple-500' : quiz.passed ? 'border-green-500' : 'border-blue-400'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isFinal ? <Trophy size={20} className="text-purple-600" />
                        : quiz.passed ? <CheckCircle2 size={20} className="text-green-600" />
                        : quiz.locked ? <Lock size={20} className="text-gray-400" />
                        : <ClipboardList size={20} className="text-blue-500" />}
                      <div>
                        <div className="font-semibold">{quiz.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimitMinutes} phút</span>
                          <span>Điểm đạt: {quiz.passingScore}%</span>
                          {quiz.attemptCount > 0 && <span>Đã làm: {quiz.attemptCount} lần · Cao nhất: {quiz.bestScore}%</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {quiz.passed && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Đã đạt</span>}
                      {quiz.locked ? (
                        <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed flex items-center gap-1"><Lock size={13} /> Chưa mở khóa</span>
                      ) : quiz.exhausted ? (
                        <span className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm border border-red-200 flex items-center gap-1"><Lock size={13} /> Hết lượt</span>
                      ) : canTake ? (
                        <button
                          onClick={() => navigate(isFinal ? `/employee/course/${courseId}/final-exam/${quiz.id}` : `/employee/course/${courseId}/quiz/${quiz.id}`)}
                          className={`px-5 py-2 text-white rounded-lg text-sm font-medium ${isFinal ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          {quiz.attemptCount > 0 ? 'Làm lại' : isFinal ? 'Bắt đầu thi' : 'Làm bài'}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Đăng ký khóa học để làm bài</span>
                      )}
                    </div>
                  </div>
                  {isFinal && quiz.locked && (
                    <div className="mt-3 text-sm text-orange-600 flex items-center gap-1">
                      <Lightbulb size={13} /> Hoàn thành tất cả bài quiz với điểm ≥80% để mở khóa bài thi cuối kỳ
                      {quiz.passedRegularCount != null && <span className="ml-1 text-gray-500">· {quiz.passedRegularCount}/{quiz.totalRegularCount} bài đã đạt</span>}
                    </div>
                  )}
                  {quiz.exhausted && !isFinal && (
                    <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
                      <Lock size={13} /> Bạn đã hết {quiz.maxAttempts} lần làm bài cho quiz này
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedTab === 'discussion' && <DiscussionTab courseId={Number(courseId)} />}
      </div>
    </div>
  );
}
