import React, { useState } from 'react';
import { Header, HrBrand } from '../../components/Header';
import { CourseManagePage } from './CourseManagePage';
import { SchedulePage } from './SchedulePage';
import { NotificationPage } from './NotificationPage';
import { UserAccountManagePage } from './UserAccountManagePage';
import { Footer } from '../../components/Footer';
import '../../assets/styles/HRDashboardPage.css';

type CurrentPageId = 'dashboard' | 'course' | 'schedule' | 'notification' | 'useraccount';

const SIDEBAR_ITEMS: ReadonlyArray<{ id: CurrentPageId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'course', label: 'Course Management' },
  { id: 'schedule', label: 'Schedule Management' },
  { id: 'notification', label: 'Notification Management' },
  { id: 'useraccount', label: 'User Account Management' },
];

const MOCK_RECENT_COURSES = [
  { id: 1, name: 'Python cơ bản', trainer: 'Nguyễn Văn A', startDate: '01/03/2026', endDate: '30/03/2026' },
  { id: 2, name: 'React & TypeScript', trainer: 'Trần Thị B', startDate: '05/03/2026', endDate: '05/04/2026' },
  { id: 3, name: 'Node.js Backend', trainer: 'Lê Văn C', startDate: '10/03/2026', endDate: '10/04/2026' },
];

interface HRDashboardPageProps {
  user: { fullName: string };
  onLogout: () => void;
}

export const HRDashboardPage: React.FC<HRDashboardPageProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<CurrentPageId>('dashboard');

  return (
    <div className="hr-dashboard-wrap">
      <Header />
      <div className="hr-dashboard">
        <aside className="hr-sidebar" aria-label="HR navigation" title={`Đăng nhập: ${user.fullName}`}>
          <div className="hr-sidebar-brand">
            <HrBrand variant="sidebar" />
          </div>
          <nav className="hr-sidebar-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`hr-sidebar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hr-sidebar-footer">
            <button type="button" className="hr-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </aside>
        <main className="hr-main">
          {currentPage === 'dashboard' && (
            <div className="hr-dashboard-content">
              <div className="hr-topbar">
                <div className="hr-topbar-left">
                  <h1 className="hr-page-title">Tổng quan</h1>
                  <div className="hr-page-subtitle">Thống kê nhanh và hoạt động gần đây</div>
                </div>
              </div>

              <div className="hr-stats">
                <div className="hr-stat-card">
                  <div className="hr-stat-icon hr-i-blue">📚</div>
                  <div className="hr-stat-meta">
                    <div className="hr-stat-value">12</div>
                    <div className="hr-stat-label">Tổng khoá học</div>
                  </div>
                </div>
                <div className="hr-stat-card">
                  <div className="hr-stat-icon hr-i-green">🗓</div>
                  <div className="hr-stat-meta">
                    <div className="hr-stat-value">28</div>
                    <div className="hr-stat-label">Tổng lịch học</div>
                  </div>
                </div>
                <div className="hr-stat-card">
                  <div className="hr-stat-icon hr-i-amber">🔔</div>
                  <div className="hr-stat-meta">
                    <div className="hr-stat-value">45</div>
                    <div className="hr-stat-label">Tổng thông báo</div>
                  </div>
                </div>
                <div className="hr-stat-card">
                  <div className="hr-stat-icon hr-i-red">👤</div>
                  <div className="hr-stat-meta">
                    <div className="hr-stat-value">9</div>
                    <div className="hr-stat-label">Trainer</div>
                  </div>
                </div>
              </div>

              <div className="hr-recent-section">
                <h2 className="hr-section-title">Khóa học gần đây</h2>
                <div className="hr-table-wrap">
                  <table className="hr-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Trainer</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_RECENT_COURSES.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td>{row.trainer}</td>
                          <td>{row.startDate}</td>
                          <td>{row.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {currentPage === 'course' && <CourseManagePage />}
          {currentPage === 'schedule' && <SchedulePage />}
          {currentPage === 'notification' && <NotificationPage />}
          {currentPage === 'useraccount' && <UserAccountManagePage />}
        </main>
      </div>
      <Footer />
    </div>
  );
};
