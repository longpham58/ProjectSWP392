import { useAuthStore } from '../../stores/auth.store';
import { mockCourses } from '../../data/mockCourses';
import { mockNotifications } from '../../data/mockNotifications';
import { mockCertificates } from '../../data/mockCertificates';
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
  const certificates = mockCertificates;

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
        <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.fullName}!</h1>
        <p className="text-gray-600">Chào mừng bạn đến với hệ thống đào tạo nội bộ</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/my-courses')}>
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-2xl font-bold text-blue-700">{myCourses.length}</span>
          </div>
          <div className="text-sm text-gray-600">Khóa học của tôi</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/my-courses')}>
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold text-green-700">{ongoingCourses.length}</span>
          </div>
          <div className="text-sm text-gray-600">Đang học</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/notifications')}>
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-2xl font-bold text-yellow-700">{unreadNotifications.length}</span>
          </div>
          <div className="text-sm text-gray-600">Thông báo mới</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => navigate('/employee/certificates')}>
          <div className="flex items-center justify-between mb-2">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-2xl font-bold text-purple-700">{certificates.length}</span>
          </div>
          <div className="text-sm text-gray-600">Chứng chỉ</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/employee/my-courses')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div className="font-medium">Tiếp tục học</div>
            <div className="text-xs opacity-90 mt-1">{ongoingCourses.length} khóa đang học</div>
          </button>

          <button
            onClick={() => navigate('/employee/schedule')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="font-medium">Lịch hôm nay</div>
            <div className="text-xs opacity-90 mt-1">Xem lịch trình</div>
          </button>

          <button
            onClick={() => navigate('/employee/certificates')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105"
          >
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <div className="font-medium">Chứng chỉ</div>
            <div className="text-xs opacity-90 mt-1">{certificates.length} chứng chỉ</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Streak */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chuỗi học tập</h3>
            <span className="text-3xl font-bold">{learningStreak}</span>
          </div>
          <p className="text-sm opacity-90 mb-3">Bạn đã học liên tục {learningStreak} ngày!</p>
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs opacity-75">Học thêm 3 ngày để đạt mốc 10 ngày</p>
        </div>

        {/* Today's Progress */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tiến độ hôm nay</h3>
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
          <h3 className="text-lg font-semibold mb-4">Thành tích gần đây</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Người học chăm chỉ</div>
                <div className="text-xs text-gray-600">Học 7 ngày liên tục</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Quiz Master</div>
                <div className="text-xs text-gray-600">Đạt 100% quiz</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
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
            <h2 className="text-xl font-semibold">Khóa học đang học</h2>
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
            <h2 className="text-xl font-semibold">Deadline sắp tới</h2>
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
            <h2 className="text-xl font-semibold">Thông báo gần đây</h2>
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
          <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  'bg-teal-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'purple' ? 'text-purple-600' :
                    'text-teal-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
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