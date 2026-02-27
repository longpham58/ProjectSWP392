import { useState } from 'react';
import '../../assets/styles/TrainerDashboard.css';
import TrainerHome from './components/TrainerHome';
import Notification from './components/Notification';
import Schedule from './components/Schedule';
import Attendance from './components/Attendance';
import Feedback from './components/Feedback';
import ViewCourse from './components/ViewCourse';
import Quiz from './components/Quiz';

type TabType = 'home' | 'notification' | 'schedule' | 'attendance' | 'feedback' | 'viewCourse' | 'quiz';

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <div className="trainer-dashboard">
      <div className="trainer-sidebar">
        <div className="trainer-profile">
          <div className="profile-avatar">
            <span>👤</span>
          </div>
        </div>

        <nav className="trainer-nav">
          <button
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 Trang chủ
          </button>
          <button
            className={`nav-btn ${activeTab === 'notification' ? 'active' : ''}`}
            onClick={() => setActiveTab('notification')}
          >
            🔔 Thông báo
          </button>
          <button
            className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Lịch dạy
          </button>
          <button
            className={`nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ✅ Điểm danh
          </button>
          <button
            className={`nav-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            💬 Phản hồi
          </button>
          <button
            className={`nav-btn ${activeTab === 'viewCourse' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewCourse')}
          >
            📚 Khóa học
          </button>
          <button
            className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            📝 Quiz
          </button>
        </nav>
      </div>

      <div className="trainer-content">
        {activeTab === 'home' && <TrainerHome />}
        {activeTab === 'notification' && <Notification />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'feedback' && <Feedback />}
        {activeTab === 'viewCourse' && <ViewCourse />}
        {activeTab === 'quiz' && <Quiz />}
      </div>
    </div>
  );
}
