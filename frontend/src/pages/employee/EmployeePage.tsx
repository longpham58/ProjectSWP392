import { useAuthStore } from '../../stores/auth.store';
import { mockCourses } from '../../data/mockCourses';
import { mockNotifications } from '../../data/mockNotifications';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function EmployeePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [learningStreak] = useState(7);
  
  // Mock data - in real app, this would come from API
  const myCourses = mockCourses.filter(c => c.status === 'ACTIVE');
  const ongoingCourses = myCourses.slice(0, 2); // Mock ongoing courses
  const completedCourses = mockCourses.filter(c => c.status === 'ARCHIVED');
  const unreadNotifications = mockNotifications.filter(n => !n.read);

  // Mock upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: 'Quiz 2: Spring Boot Advanced', course: 'Spring Boot Microservices', dueDate: '2026-03-05', daysLeft: 3, priority: 'high' },
    { id: 2, title: 'Final Exam', course: 'React & TypeScript', dueDate: '2026-03-08', daysLeft: 6, priority: 'high' },
    { id: 3, title: 'Quiz 1: Docker Basics', course: 'Docker & Kubernetes', dueDate: '2026-03-12', daysLeft: 10, priority: 'medium' },
  ];

  // Mock recent activities
  const recentActivities = [
    { id: 1, type: 'quiz', title: 'Hoàn thành Quiz 1', course: 'Spring Boot Microservices', time: '2 giờ trước', icon: '✅', color: 'green' },
    { id: 2, type: 'course', title: 'Tham gia khóa học mới', course: 'Docker & Kubernetes', time: '1 ngày trước', icon: '📚', color: 'blue' },
    { id: 3, type: 'certificate', title: 'Nhận chứng chỉ', course: 'Python Cơ bản', time: '2 ngày trước', icon: '🏆', color: 'purple' },
    { id: 4, type: 'lesson', title: 'Hoàn thành bài học', course: 'React & TypeScript', time: '3 ngày trước', icon: '📖', color: 'teal' },
  ];

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
            <span className="text-3xl">✅</span>
            <span className="text-2xl font-bold text-purple-700">{completedCourses.length}</span>
          </div>
          <div className="text-sm text-gray-600">Đã hoàn thành</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">🚀 Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            onClick={() => {
              const firstOngoing = ongoingCourses[0];
              if (firstOngoing) navigate(`/employee/course/${firstOngoing.id}`);
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-medium">Làm Quiz</div>
            <div className="text-xs opacity-90 mt-1">Kiểm tra kiến thức</div>
          </button>

          <button
            onClick={() => navigate('/employee/certificates')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-medium">Chứng chỉ</div>
            <div className="text-xs opacity-90 mt-1">{completedCourses.length} chứng chỉ</div>
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
          <p className="text-sm opacity-90 mb-3">Bạn đã học liên tục {learningStreak} ngày!</p>
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs opacity-75">Học thêm 3 ngày để đạt mốc 10 ngày 🎯</p>
        </div>

        {/* Today's Progress */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Tiến độ hôm nay</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Bài học hoàn thành</span>
                <span className="font-medium">3/5</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Thời gian học</span>
                <span className="font-medium">2.5h/4h</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Quiz hoàn thành</span>
                <span className="font-medium">1/2</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
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
              {ongoingCourses.map((course, index) => (
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
                        style={{ width: `${(index + 1) * 30}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{(index + 1) * 30}%</span>
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
          <div className="space-y-3">
            {upcomingDeadlines.map(deadline => (
              <div 
                key={deadline.id}
                className={`border-l-4 pl-4 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${
                  deadline.priority === 'high' ? 'border-red-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{deadline.title}</div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    deadline.daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                    deadline.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {deadline.daysLeft} ngày
                  </span>
                </div>
                <div className="text-xs text-gray-600">{deadline.course}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Hạn: {new Date(deadline.dueDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-xs text-gray-600">{activity.course}</div>
                  <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}