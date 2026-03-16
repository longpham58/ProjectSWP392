import React, { useState } from 'react';
import NotificationSection from './components/NotificationSection';
import ScheduleSection from './components/ScheduleSection';
import AttendanceSection from './components/AttendanceSection';
import FeedbackSection from './components/FeedbackSection';
import ViewCourseSection from './components/ViewCourseSection';

type ActiveSection = 'notification' | 'schedule' | 'attendance' | 'feedback' | 'viewCourse';

const TrainerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('notification');

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('mockUser');
    localStorage.removeItem('rememberMe');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'notification':
        return <NotificationSection />;
      case 'schedule':
        return <ScheduleSection />;
      case 'attendance':
        return <AttendanceSection />;
      case 'feedback':
        return <FeedbackSection />;
      case 'viewCourse':
        return <ViewCourseSection />;
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
          <span className="text-xs text-gray-600 font-medium">Trainer</span>
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
          Notification
        </button>

        <button
          onClick={() => setActiveSection('schedule')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'schedule'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Schedule
        </button>

        <button
          onClick={() => setActiveSection('attendance')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'attendance'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Attendance
        </button>

        <button
          onClick={() => setActiveSection('feedback')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'feedback'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Feedback
        </button>

        <button
          onClick={() => setActiveSection('viewCourse')}
          className={`w-24 py-3 rounded-lg text-sm font-medium transition ${
            activeSection === 'viewCourse'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          View Course
        </button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-24 py-3 rounded-lg text-sm font-medium transition bg-red-500 text-white hover:bg-red-600"
          title="Logout"
        >
          Logout
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
