import React, { useEffect, useState } from 'react';
import { Header, HrBrand } from '../../components/Header';
import { CourseManagePage } from './component/CourseManage';
import { ClassManagePage } from './component/ClassManage';
import { SchedulePage } from './component/Schedule';
import { NotificationPage } from './component/Notification';
import { UserAccountManagePage } from './component/UserAccountManage';
import { Footer } from '../../components/Footer';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import courseApi from '../../api/course.api.wrapper';
import type { CourseDto } from '../../api/course.api';
import '@/assets/styles/HRDashboardPage.css';

type CurrentPageId = 'dashboard' | 'course' | 'classroom' | 'schedule' | 'notification' | 'useraccount';

const SIDEBAR_ITEMS: ReadonlyArray<{ id: CurrentPageId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'course', label: 'Course Management' },
  { id: 'classroom', label: 'Class Management' },
  { id: 'schedule', label: 'Schedule Management' },
  { id: 'notification', label: 'Notification Management' },
  { id: 'useraccount', label: 'User Account Management' },
];

interface HRDashboardPageProps {
  user: { fullName: string };
  onLogout: () => void;
}

export const HRDashboardPage: React.FC<HRDashboardPageProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<CurrentPageId>('dashboard');
  const [recentCourses, setRecentCourses] = useState<CourseDto[]>([]);
  const [courseRefreshToken, setCourseRefreshToken] = useState(0);
  const [hrRefreshToken, setHrRefreshToken] = useState(0);
  const [lastCreatedCourseId, setLastCreatedCourseId] = useState<number | undefined>(undefined);

  const notifyHrDataChanged = () => {
    setHrRefreshToken((prev) => prev + 1);
  };

  useEffect(() => {
    if (currentPage !== 'dashboard') return;
    courseApi.getMyCourses()
      .then((res) => {
        if (res.success) {
          setRecentCourses(res.data.slice(0, 5));
        }
      })
      .catch(() => {
        setRecentCourses([]);
      });
  }, [currentPage, courseRefreshToken, hrRefreshToken]);

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

              <DashboardAnalytics refreshToken={hrRefreshToken} />

              <div className="hr-recent-section">
                <h2 className="hr-section-title">Khóa học gần đây</h2>
                <div className="hr-table-wrap">
                  <table className="hr-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mã khoá học</th>
                        <th>Tên khoá học</th>
                        <th>Trainer</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCourses.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.code || `ITMS-${String(row.id).padStart(3, '0')}`}</td>
                          <td>{(row.title || row.name || '').trim() || 'Chưa có tên khoá học'}</td>
                          <td>{row.trainerName || '-'}</td>
                          <td>{row.status || '-'}</td>
                        </tr>
                      ))}
                      {recentCourses.length === 0 && (
                        <tr>
                          <td colSpan={5}>Không có dữ liệu.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {currentPage === 'course' && (
            <CourseManagePage
              onCoursesChanged={(newCourseId?: number) => {
                setCourseRefreshToken((prev) => prev + 1);
                notifyHrDataChanged();
                if (newCourseId) {
                  setLastCreatedCourseId(newCourseId);
                  setCurrentPage('classroom');
                }
              }}
            />
          )}
          {currentPage === 'classroom' && (
            <ClassManagePage
              onClassesChanged={notifyHrDataChanged}
              defaultCourseId={lastCreatedCourseId}
            />
          )}
          {currentPage === 'schedule' && <SchedulePage onSchedulesChanged={notifyHrDataChanged} />}
          {currentPage === 'notification' && <NotificationPage onNotificationsChanged={notifyHrDataChanged} />}
          {currentPage === 'useraccount' && <UserAccountManagePage refreshToken={hrRefreshToken} />}
        </main>
      </div>
      <Footer />
    </div>
  );
};
