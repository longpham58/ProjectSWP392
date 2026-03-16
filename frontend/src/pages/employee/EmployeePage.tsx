import { useAuthStore } from '../../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCourseStore } from '../../stores/course.store';
import { useNotificationStore } from '../../stores/notification.store';
import { useCertificateStore } from '../../stores/certificate.store';
import { useStreakStore } from '../../stores/streak.store';
import { useDashboardStore } from '../../stores/dashboard.store';

export default function EmployeePage() {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const { certificates, fetchCertificates } = useCertificateStore();

  const navigate = useNavigate();
  const { courses, fetchMyCourses } = useCourseStore();
  const { streak, fetchStreak, loading: streakLoading } = useStreakStore();
  const { deadlines, activities, todayProgress, loading: dashboardLoading, fetchDashboardData } = useDashboardStore();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchMyCourses(user?.id),
          fetchNotifications(),
          fetchCertificates(user?.id || 0),
          fetchStreak(),
          fetchDashboardData()
        ]);
        console.log(courses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user?.id]);

  // Get courses from API store
  const myCourses = courses;
  const ongoingCourses = courses.filter(c => c.status === "ACTIVE");
  const completedCourses = courses.filter(c => c.status === "ARCHIVED");
  const unreadNotifications = notifications.filter(n => !n.read);
  const learningStreak = streak ?? 0;
  const milestone = 10;
  const progress = Math.min((learningStreak / milestone) * 100, 100);
  const daysRemaining = Math.max(milestone - learningStreak, 0);

  // Today's progress from API
  const progressData = todayProgress || {
    lessonsCompleted: 0,
    lessonsTarget: 1,
    studyHours: 0,
    studyTarget: 1,
    quizzesCompleted: 0,
    quizzesTarget: 1
  };

  const lessonProgress =
  progressData?.lessonsTarget > 0
    ? (progressData.lessonsCompleted / progressData.lessonsTarget) * 100
    : 0;

  const timeProgress =
  progressData?.studyTarget > 0
    ? (progressData.studyHours / progressData.studyTarget) * 100
    : 0;

  const quizProgress =
  progressData?.quizzesTarget > 0
    ? (progressData.quizzesCompleted / progressData.quizzesTarget) * 100
    : 0;
  
  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.fullName}! 👋</h1>
        <p className="text-gray-600">Chào mừng bạn đến với hệ thống đào tạo nội bộ</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/my-courses')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📚</span>
            <span className="text-2xl font-bold text-blue-700">{myCourses.length}</span>
          </div>
          <div className="text-sm text-gray-600">Khóa học của tôi</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/my-courses')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📖</span>
            <span className="text-2xl font-bold text-green-700">{ongoingCourses.length}</span>
          </div>
          <div className="text-sm text-gray-600">Đang học</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/notifications')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔔</span>
            <span className="text-2xl font-bold text-yellow-700">{unreadNotifications.length}</span>
          </div>
          <div className="text-sm text-gray-600">Thông báo mới</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/certificates')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🏆</span>
            <span className="text-2xl font-bold text-purple-700">{certificates.length}</span>
          </div>
          <div className="text-sm text-gray-600">Chứng chỉ</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">🚀 Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/employee/my-courses')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="font-medium">Tiếp tục học</div>
            <div className="text-xs opacity-90 mt-1">{ongoingCourses.length} khóa đang học</div>
          </button>

          <button
            onClick={() => navigate('/employee/schedule')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="font-medium">Lịch hôm nay</div>
            <div className="text-xs opacity-90 mt-1">Xem lịch trình</div>
          </button>

          <button
            onClick={() => navigate('/employee/certificates')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-medium">Chứng chỉ</div>
            <div className="text-xs opacity-90 mt-1">{certificates.length} chứng chỉ</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Streak */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg p-6 text-white">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🔥 Chuỗi học tập</h3>
            <span className="text-3xl font-bold">{learningStreak}</span>
          </div>

          {/* MESSAGE */}
          {learningStreak === 0 ? (
            <p className="text-sm opacity-90 mb-3">
              Hãy bắt đầu học hôm nay để tạo chuỗi học tập! 🚀
            </p>
          ) : (
            <p className="text-sm opacity-90 mb-3">
              Bạn đã học liên tục {learningStreak} ngày!
            </p>
          )}

          {/* PROGRESS BAR */}
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* MILESTONE TEXT */}
          {learningStreak === 0 ? (
            <p className="text-xs opacity-75">
              Hoàn thành ngày học đầu tiên để bắt đầu chuỗi 🔥
            </p>
          ) : learningStreak >= milestone ? (
            <p className="text-xs opacity-75">
              🎉 Tuyệt vời! Bạn đã đạt mốc {milestone} ngày học liên tiếp!
            </p>
          ) : (
            <p className="text-xs opacity-75">
              Học thêm {daysRemaining} ngày để đạt mốc {milestone} ngày 🎯
            </p>
          )}

        </div>

        {/* Today's Progress */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Tiến độ hôm nay</h3>
          
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">

              {/* Sessions */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Buổi học tham gia</span>
                  <span className="font-medium">
                    {progressData.lessonsCompleted}/{progressData.lessonsTarget}
                  </span>
                </div>

                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${lessonProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Study Time */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Giờ học</span>
                  <span className="font-medium">
                    {progressData.studyHours}h/{progressData.studyTarget}h
                  </span>
                </div>

                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${timeProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Quiz */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Bài kiểm tra</span>
                  <span className="font-medium">
                    {progressData.quizzesCompleted}/{progressData.quizzesTarget}
                  </span>
                </div>

                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${quizProgress}%` }}
                  ></div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🏅 Thành tích gần đây</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <div className="font-medium text-sm">Người học chăm chỉ</div>
                <div className="text-xs text-gray-600">Học 7 ngày liên tục</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <div className="font-medium text-sm">Quiz Master</div>
                <div className="text-xs text-gray-600">Đạt 100% quiz</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
              <span className="text-2xl">🎓</span>
              <div className="flex-1">
                <div className="font-medium text-sm">Hoàn thành khóa học</div>
                <div className="text-xs text-gray-600">3 chứng chỉ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ongoing Courses */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📖 Khóa học đang học</h2>
            <button
              onClick={() => navigate('/employee/my-courses')}
              className="text-sm text-blue-600 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          {ongoingCourses.length > 0 ? (
            <div className="space-y-3">
              {ongoingCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="border-l-4 border-blue-600 pl-4 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                  onClick={() => navigate(`/employee/course/${course.id}`)}
                >
                  <div className="font-medium">{course.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{course.trainer}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(course as any).progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{(course as any).progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có khóa học đang học</p>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">⏰ Deadline sắp tới</h2>
            <button
              onClick={() => navigate('/employee/my-courses')}
              className="text-sm text-blue-600 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : deadlines.length > 0 ? (
            <div className="space-y-3">
              {deadlines.map(deadline => (
                <div 
                  key={deadline.id}
                  className={`border-l-4 pl-4 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                    deadline.priority === 'high' ? 'border-red-500' : 
                    deadline.type === 'SESSION' ? 'border-blue-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm">
                      {deadline.type === 'SESSION' ? '📅 ' : '📝 '}{deadline.title}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      deadline.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                      deadline.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {deadline.daysLeft === 0 ? 'Hôm nay' : 
                       deadline.daysLeft === 1 ? 'Ngày mai' :
                       `${deadline.daysLeft} ngày`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{deadline.course}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {deadline.type === 'SESSION' ? 'Lịch học: ' : 'Hạn: '} 
                    {new Date(deadline.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có deadline sắp tới</p>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🔔 Thông báo gần đây</h2>
            <button
              onClick={() => navigate('/employee/notifications')}
              className="text-sm text-blue-600 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          {unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.slice(0, 4).map(notif => (
                <div 
                  key={notif.id} 
                  className="border-l-4 border-yellow-500 pl-4 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                  onClick={() => navigate('/employee/notifications')}
                >
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{notif.date}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có thông báo mới</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📜 Hoạt động gần đây</h2>
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-2xl">{activity.icon || '📖'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-gray-600">{activity.course}</div>
                    <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có hoạt động gần đây</p>
          )}
        </div>
      </div>
    </div>
  );
}
