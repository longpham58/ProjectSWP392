import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, HrBrand } from '../../components/Header';
import { CourseManagePage } from './component/CourseManage';
import { ClassManagePage } from './component/ClassManage';
import { SchedulePage } from './component/Schedule';
import NotificationSection from './components/NotificationSection';
import { UserAccountManagePage } from './component/UserAccountManage';
import { HrCertificatePage } from './component/HrCertificatePage';

import { Footer } from '../../components/Footer';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import courseApi from '../../api/course.api.wrapper';
import type { CourseDto } from '../../api/course.api';
import '@/assets/styles/HRDashboardPage.css';

type CurrentPageId = 'dashboard' | 'course' | 'classroom' | 'schedule' | 'notification' | 'useraccount' | 'certificate';

const ROUTE_MAP: Record<string, CurrentPageId> = {
  'dashboard':     'dashboard',
  'courses':       'course',
  'classes':       'classroom',
  'schedule':      'schedule',
  'certificate':   'certificate',
  'notifications': 'notification',
  'accounts':      'useraccount',
};

const PAGE_TO_ROUTE: Record<CurrentPageId, string> = {
  'dashboard':   'dashboard',
  'course':      'courses',
  'classroom':   'classes',
  'schedule':    'schedule',
  'certificate': 'certificate',
  'notification':'notifications',
  'useraccount': 'accounts',
};

const SIDEBAR_ITEMS: ReadonlyArray<{ id: CurrentPageId; label: string }> = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'course', label: 'Quản lý khóa học' },
  { id: 'classroom', label: 'Quản lý lớp học' },
  { id: 'schedule', label: 'Quản lý lịch học' },
  { id: 'certificate', label: 'Cấp chứng chỉ' },
  { id: 'notification', label: 'Quản lý thông báo' },
  { id: 'useraccount', label: 'Quản lý tài khoản' },
];

interface HRDashboardPageProps {
  user: { fullName: string };
  onLogout: () => void;
}

export const HRDashboardPage: React.FC<HRDashboardPageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  const pageFromUrl: CurrentPageId = (section && ROUTE_MAP[section]) || 'dashboard';
  const [currentPage, setCurrentPage] = useState<CurrentPageId>(pageFromUrl);
  const [recentCourses, setRecentCourses] = useState<CourseDto[]>([]);
  const [courseRefreshToken, setCourseRefreshToken] = useState(0);
  const [hrRefreshToken, setHrRefreshToken] = useState(0);
  const [lastCreatedCourseId, setLastCreatedCourseId] = useState<number | undefined>(undefined);

  // Sync URL when page changes
  const handlePageChange = (page: CurrentPageId) => {
    setCurrentPage(page);
    navigate(`/hr/${PAGE_TO_ROUTE[page]}`, { replace: true });
  };

  // Sync state when URL changes (browser back/forward)
  useEffect(() => {
    const page = (section && ROUTE_MAP[section]) || 'dashboard';
    setCurrentPage(page);
  }, [section]);

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
                onClick={() => handlePageChange(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hr-sidebar-footer">
            <button type="button" className="hr-logout-btn" onClick={onLogout}>
              Đăng xuất
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
                        <th>Mã khóa học</th>
                        <th>Tên khóa học</th>
                        <th>Giảng viên</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCourses.map((row) => (
                        <tr key={row.id}>
                          <td>{row.code || `ITMS-${String(row.id).padStart(3, '0')}`}</td>
                          <td>{(row.title || row.name || '').trim() || 'Chưa có tên khoá học'}</td>
                          <td>{row.trainerName || '-'}</td>
                          <td>{row.status || '-'}</td>
                        </tr>
                      ))}
                      {recentCourses.length === 0 && (
                        <tr>
                          <td colSpan={4}>Không có dữ liệu.</td>
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
                  handlePageChange('classroom');
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
          {currentPage === 'notification' && <NotificationSection />}
          { currentPage === 'useraccount' && <UserAccountManagePage refreshToken={hrRefreshToken} />}
          {currentPage === 'certificate' && <HrCertificatePage />}

        </main>
      </div>
      <Footer />
    </div>
  );
};
