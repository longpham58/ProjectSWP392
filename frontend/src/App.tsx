import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/common/Toast";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminNotificationsPage from "./pages/admin/NotificationsPage";
import AdminSystemFeedbackPage from "./pages/admin/FeedbackPage";
import AdminCoursesPage from "./pages/admin/CoursesPage";
import AdminCourseDetailPage from "./pages/admin/CourseDetailPage";

import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeePage from "./pages/employee/EmployeePage";
import CertificatesPage from "./pages/employee/CertificatesPage";
import MyCoursesPage from "./pages/employee/MyCoursesPage";
import SchedulePage from "./pages/employee/SchedulePage";
import EmployeeNotificationsPage from "./pages/employee/NotificationsPage";
import ProfilePage from "./pages/employee/ProfilePage";
import CourseDetailPage from "./pages/employee/CourseDetailPage";
import QuizPage from "./pages/employee/QuizPage";

import TrainerDashboard from "./pages/trainer/TrainerDashboard";

import type { MockUser } from "./data/mockUsers";

function App() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("mockUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ 
    children, 
    allowedRoles 
  }: { 
    children: React.ReactNode; 
    allowedRoles: string[] 
  }) => {
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to={getHomeByRole(user.roles[0])} replace /> : <HomePage />} 
          />
          <Route
            path="/login"
            element={user ? <Navigate to={getHomeByRole(user.roles[0])} replace /> : <LoginPage />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="feedback" element={<AdminSystemFeedbackPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="courses/:id" element={<AdminCourseDetailPage />} />
          </Route>

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeePage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="my-courses" element={<MyCoursesPage />} />
            <Route path="course/:courseId" element={<CourseDetailPage />} />
            <Route path="quiz/:quizId" element={<QuizPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="notifications" element={<EmployeeNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold mb-4">Cài đặt</h1><p className="text-gray-600">Tính năng đang được phát triển...</p></div>} />
          </Route>

          {/* Trainer Routes */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={["TRAINER"]}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

// Helper function
function getHomeByRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYEE":
      return "/employee";
    case "TRAINER":
      return "/trainer";
    default:
      return "/";
  }
}
