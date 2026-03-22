import { useAuthStore } from '../../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { employeeApi } from '../../api/employee.api';
import {
  BookOpen, BookMarked, Bell, Award, CalendarDays,
  ChevronRight, Clock, CheckCircle2, MapPin,
  Video, TrendingUp, GraduationCap, Loader2
} from 'lucide-react';

interface DashboardData {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  learningProgress: number;
  totalCertificates: number;
  unreadNotifications: number;
  myCourses: any[];
  notifications: any[];
  upcomingSessions: any[];
}

export default function EmployeePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    employeeApi.getDashboard(user.id)
      .then(res => setData(res.data as any))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const d = data ?? {
    totalEnrolledCourses: 0, completedCourses: 0, inProgressCourses: 0,
    learningProgress: 0, totalCertificates: 0, unreadNotifications: 0,
    myCourses: [], notifications: [], upcomingSessions: []
  };

  const stats = [
    { icon: BookOpen, label: 'Khóa học của tôi', value: d.totalEnrolledCourses, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', path: '/employee/my-courses' },
    { icon: BookMarked, label: 'Đang học', value: d.inProgressCourses, color: '#16A34A', bg: '#ECFDF5', border: '#BBF7D0', path: '/employee/my-courses' },
    { icon: Award, label: 'Chứng chỉ', value: d.totalCertificates, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', path: '/employee/certificates' },
    { icon: Bell, label: 'Thông báo mới', value: d.unreadNotifications, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', path: '/employee/notifications' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Xin chào, {user?.fullName} 👋</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg, border, path }) => (
          <div key={label} onClick={() => navigate(path)}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
            className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-3xl font-bold" style={{ color }}>{value}</span>
            </div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            <h2 className="font-semibold text-lg">Tiến độ học tập tổng thể</h2>
          </div>
          <span className="text-3xl font-bold">{Math.round(d.learningProgress)}%</span>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full h-3 mb-3">
          <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${d.learningProgress}%` }} />
        </div>
        <div className="flex gap-6 text-sm opacity-90">
          <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {d.completedCourses} hoàn thành</span>
          <span className="flex items-center gap-1"><BookOpen size={14} /> {d.inProgressCourses} đang học</span>
          <span className="flex items-center gap-1"><GraduationCap size={14} /> {d.totalCertificates} chứng chỉ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* My Courses */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BookMarked size={18} className="text-blue-600" />
              <h2 className="font-semibold">Khóa học đang học</h2>
            </div>
            <button onClick={() => navigate('/employee/my-courses')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          {d.myCourses.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có khóa học nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {d.myCourses.map((course: any) => (
                <div key={course.id}
                  onClick={() => navigate(`/employee/course/${course.id}`)}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{course.title}</div>
                    <div className="text-xs text-gray-500 mb-1.5">{course.trainerName ?? '—'}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${course.progress ?? 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{course.progress ?? 0}%</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-green-600" />
              <h2 className="font-semibold">Buổi học sắp tới</h2>
            </div>
            <button onClick={() => navigate('/employee/schedule')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Lịch <ChevronRight size={14} />
            </button>
          </div>
          {d.upcomingSessions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CalendarDays size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có buổi học sắp tới</p>
            </div>
          ) : (
            <div className="space-y-3">
              {d.upcomingSessions.map((s: any) => (
                <div key={s.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-sm mb-1 truncate">{s.courseName ?? s.className}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Clock size={11} />
                    {s.date} · {s.timeStart?.slice(0, 5)} – {s.timeEnd?.slice(0, 5)}
                  </div>
                  {s.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {s.locationType === 'ONLINE' ? <Video size={11} /> : <MapPin size={11} />}
                      {s.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-yellow-500" />
            <h2 className="font-semibold">Thông báo gần đây</h2>
            {d.unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{d.unreadNotifications}</span>
            )}
          </div>
          <button onClick={() => navigate('/employee/notifications')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>
        {d.notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Không có thông báo mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.notifications.map((n: any) => (
              <div key={n.id}
                onClick={() => navigate('/employee/notifications')}
                className={`border-l-4 pl-4 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors ${!n.readStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{n.title}</div>
                  {!n.readStatus && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
