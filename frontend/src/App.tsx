import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";

import OtpGuard from "./guards/OtpGuard";
import ResetPasswordGuard from "./guards/ResetPasswordGuard";
import RoleProtectedRoute from "./guards/RoleProtectedRoute";
import HomeRedirect from "./guards/HomeRedirect";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeePage from "./pages/employee/EmployeePage";
import HRLayout from "./layouts/HRLayout";
import TrainerLayout from "./layouts/TrainerLayout";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import { useAuthStore } from "./stores/auth.store";
import UsersPage from "./pages/admin/UsersPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import AdminSystemFeedbackPage from "./pages/admin/FeedbackPage";
import AdminCoursesPage from "./pages/admin/CoursesPage";
import AdminCourseDetailPage from "./pages/admin/CourseDetailPage";

function App() {
  const { fetchMe, user} = useAuthStore();



  // Restore session on refresh
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC HOME PAGE */}
    <Route path="/" element={ user ? <Navigate to="/home-redirect" replace /> : <HomePage />} />

     {/* 🔁 ROLE-BASED REDIRECT */}
    <Route path="/home-redirect" element={<HomeRedirect />} />

         {/* LOGIN */}
    <Route
      path="/login"
      element={
        user ? <Navigate to="/home-redirect" replace /> : <LoginPage />
      }
    />
        
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
       <Route
        path="/otp"
        element={
          <OtpGuard>
            <OtpPage />
          </OtpGuard>
        }
      />
   <Route
        path="/reset-password"
        element={
          <ResetPasswordGuard>
            <ResetPasswordPage />
          </ResetPasswordGuard>
        }
      />


         <Route
  path="/admin"
  element={
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout />
    </RoleProtectedRoute>
  }
>
  {/* Default redirect */}
  <Route index element={<Navigate to="dashboard" replace />} />

  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="analytics" element={<AnalyticsPage />} />
  <Route path="notifications" element={<NotificationsPage />} />
  <Route path="audit-logs" element={<AuditLogsPage />} />
  <Route path="feedback" element={<AdminSystemFeedbackPage />} />
  <Route path="courses" element={<AdminCoursesPage />} />
   <Route path="courses/:id" element={<AdminCourseDetailPage />} />
</Route>

<Route
  path="/employee"
  element={
    <RoleProtectedRoute allowedRoles={["EMPLOYEE"]}>
      <EmployeeLayout />
    </RoleProtectedRoute>
  }
>
  <Route index element={<EmployeePage />} />
</Route>

<<<<<<< HEAD
<Route
  path="/hr"
  element={
    <RoleProtectedRoute allowedRoles={["HR"]}>
      <HRLayout />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/trainer"
  element={
    <RoleProtectedRoute allowedRoles={["TRAINER"]}>
      <TrainerLayout />
    </RoleProtectedRoute>
  }
>
  <Route index element={<TrainerDashboard />} />
</Route>
=======
>>>>>>> 93cbe726cd117a21ad89e01ec71b9ab31f42126a

      </Routes>
    </BrowserRouter>
  );
}

export default App;
