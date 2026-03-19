import { useAuthStore } from '../../stores/auth.store';
import { mockCourses } from '../../data/mockCourses';
import { mockNotifications } from '../../data/mockNotifications';
import { mockCertificates } from '../../data/mockCertificates';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  BookOpen, BookMarked, Bell, Award, Zap, CalendarDays,
  Flame, BarChart3, Trophy, Star, GraduationCap,
  Clock, AlertCircle, CheckCircle2, Activity, ChevronRight
} from 'lucide-react';

export default function EmployeePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [learningStreak] = useState(7);

  const myCourses = mockCourses.filter(c => c.status === 'ACTIVE');
  const ongoingCourses = myCourses.slice(0, 2);
  const unreadNotifications = mockNotifications.filter(n => !n.read);
  const certificates = mockCertificates;

  const upcomingDeadlines = [
    { id: 1, title: 'Quiz 2: Spring Boot Advanced', course: 'Spring Boot Microservices', dueDate: '2026-03-05', daysLeft: 3, priority: 'high' },
    { id: 2, title: 'Final Exam', course: 'React & TypeScript', dueDate: '2026-03-08', daysLeft: 6, priority: 'high' },
    { id: 3, title: 'Quiz 1: Docker Basics', course: 'Docker & Kubernetes', dueDate: '2026-03-12', daysLeft: 10, priority: 'medium' },
  ];

  const recentActivities = [
    { id: 1, type: 'quiz', title: 'Hoàn thành Quiz 1', course: 'Spring Boot Microservices', time: '2 giờ trước', icon: CheckCircle2, color: '#16A34A', bg: '#ECFDF5' },
    { id: 2, type: 'course', title: 'Tham gia khóa học mới', course: 'Docker & Kubernetes', time: '1 ngày trước', icon: BookOpen, color: '#2563EB', bg: '#EFF6FF' },
    { id: 3, type: 'certificate', title: 'Nhận chứng chỉ', course: 'Python Cơ bản', time: '2 ngày trước', icon: Award, color: '#7C3AED', bg: '#F5F3FF' },
    { id: 4, type: 'lesson', title: 'Hoàn thành bài học', course: 'React & TypeScript', time: '3 ngày trước', icon: BookMarked, color: '#0D9488', bg: '#F0FDFA' },
  ];

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Xin chào, {user?.fullName}</h1>
        <p className="text-gray-500">Chào mừng đến với hệ thống đào tạo nội bộ</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Khóa học của tôi', value: myCourses.length, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', onClick: () => navigate('/employee/my-courses') },
          { icon: BookMarked, label: 'Đang học', value: ongoingCourses.length, color: '#16A34A', bg: '#ECFDF5', border: '#BBF7D0', onClick: () => navigate('/employee/my-courses') },
          { icon: Bell, label: 'Thông báo mới', value: unreadNotifications.length, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', onClick: () => navigate('/employee/notifications') },
          { icon: Award, label: 'Chứng chỉ', value: certificates.length, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', onClick: () => navigate('/employee/certificates') },
        ].map(({ icon: Icon, label, value, color, bg, border, onClick }) => (
          <div key={label}
            onClick={onClick}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span style={{ fontSize: '26px', fontWeight: 700, color }}>{value}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} />
          <h2 className="text-lg font-semibold">Hành động nhanh</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: 'Tiếp tục học', sub: `${ongoingCourses.length} khóa đang học`, onClick: () => navigate('/employee/my-courses') },
            { icon: CalendarDays, label: 'Lịch hôm nay', sub: 'Xem lịch trình', onClick: () => navigate('/employee/schedule') },
            { icon: Award, label: 'Chứng chỉ', sub: `${certificates.length} chứng chỉ`, onClick: () => navigate('/employee/certificates') },
          ].map(({ icon: Icon, label, sub, onClick }) => (
            <button key={label} onClick={onClick}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '16px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <Icon size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Streak */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={20} />
              <h3 className="font-semibold">Chuỗi học tập</h3>
            </div>
            <span className="text-3xl font-bold">{learningStreak}</span>
          </div>
          <p className="text-sm opacity-90 mb-3">Bạn đã học liên tục {learningStreak} ngày!</p>
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-xs opacity-75">Học thêm 3 ngày để đạt mốc 10 ngày</p>
        </div>

        {/* Today's Progress */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="font-semibold">Tiến độ hôm nay</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Bài học hoàn thành', value: '3/5', pct: 60, color: '#16A34A' },
              { label: 'Thời gian học', value: '2.5h/4h', pct: 62.5, color: '#2563EB' },
              { label: 'Quiz hoàn thành', value: '1/2', pct: 50, color: '#7C3AED' },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-yellow-500" />
            <h3 className="font-semibold">Thành tích gần đây</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: Trophy, label: 'Người học chăm chỉ', sub: 'Học 7 ngày liên tục', color: '#D97706', bg: '#FFFBEB' },
              { icon: Star, label: 'Quiz Master', sub: 'Đạt 100% quiz', color: '#2563EB', bg: '#EFF6FF' },
              { icon: GraduationCap, label: 'Hoàn thành khóa học', sub: '3 chứng chỉ', color: '#16A34A', bg: '#ECFDF5' },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', background: bg }}>
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ongoing Courses */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BookMarked size={18} className="text-blue-600" />
              <h2 className="font-semibold">Khóa học đang học</h2>
            </div>
            <button onClick={() => navigate('/employee/my-courses')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          {ongoingCourses.length > 0 ? (
            <div className="space-y-3">
              {ongoingCourses.map((course, index) => (
                <div key={course.id}
                  onClick={() => navigate(`/employee/course/${course.id}`)}
                  className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                  <div className="font-medium text-sm">{course.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{course.trainer}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(index + 1) * 30}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{(index + 1) * 30}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Chưa có khóa học đang học</p>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              <h2 className="font-semibold">Deadline sắp tới</h2>
            </div>
            <button onClick={() => navigate('/employee/my-courses')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map(d => (
              <div key={d.id} className={`border-l-4 pl-4 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${d.priority === 'high' ? 'border-red-400' : 'border-yellow-400'}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{d.title}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.daysLeft <= 3 ? 'bg-red-50 text-red-600' : d.daysLeft <= 7 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {d.daysLeft} ngày
                  </span>
                </div>
                <div className="text-xs text-gray-500">{d.course}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-yellow-500" />
              <h2 className="font-semibold">Thông báo gần đây</h2>
            </div>
            <button onClick={() => navigate('/employee/notifications')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          {unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.slice(0, 4).map(notif => (
                <div key={notif.id}
                  onClick={() => navigate('/employee/notifications')}
                  className="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{notif.date}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Không có thông báo mới</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-purple-500" />
            <h2 className="font-semibold">Hoạt động gần đây</h2>
          </div>
          <div className="space-y-3">
            {recentActivities.map(({ id, icon: Icon, title, course, time, color, bg }) => (
              <div key={id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                <div style={{ width: '32px', height: '32px', background: bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{title}</div>
                  <div className="text-xs text-gray-500">{course}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
