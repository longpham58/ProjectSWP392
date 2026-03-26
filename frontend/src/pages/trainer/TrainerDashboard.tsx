import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import NotificationSection from './components/NotificationSectionNew';
import ScheduleSection from './components/ScheduleSection';
import AttendanceSection from './components/AttendanceSection';
import ViewCourseSection from './components/ViewCourseSection';
import FeedbackSection from './components/FeedbackSection';

type ActiveSection = 'notification' | 'schedule' | 'attendance' | 'viewCourse' | 'feedback';

const TrainerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('notification');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API
      await logout();
      
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'notification':
        return <NotificationSection />;
      case 'schedule':
        return <ScheduleSection />;
      case 'attendance':
        return <AttendanceSection />;

      case 'viewCourse':
        return <ViewCourseSection />;
      case 'feedback':
        return <FeedbackSection />;
      default:
        return <NotificationSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-32 bg-white shadow-lg flex flex-col items-center py-8 space-y-6">
        {/* User Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-2 text-white text-2xl font-bold">
            T
          </div>
          <span className="text-xs text-gray-600 font-medium">Giảng viên</span>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => setActiveSection('notification')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'notification'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Thông báo
        </button>

        <button
          onClick={() => setActiveSection('schedule')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'schedule'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Lịch học
        </button>

        <button
          onClick={() => setActiveSection('attendance')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'attendance'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Điểm danh
        </button>

        <button
          onClick={() => setActiveSection('viewCourse')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'viewCourse'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Xem khóa học
        </button>

        <button
          onClick={() => setActiveSection('feedback')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'feedback'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Phản hồi
        </button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            isLoggingOut
              ? 'bg-red-300 text-white cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>...</span>
            </div>
          ) : (
            'Đăng xuất'
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderSection()}
      </div>
    </div>
  );
};

export default TrainerDashboard;
