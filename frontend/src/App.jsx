import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";

import OtpGuard from "./guards/OtpGuard";
import ResetPasswordGuard from "./guards/ResetPasswordGuard";
import RoleProtectedRoute from "./guards/RoleProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeePage from "./pages/employee/EmployeePage";
import { useAuthStore } from "./stores/auth.store";

function App() {
  const { fetchMe } = useAuthStore();

  // 🔁 Restore session on refresh
  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* 🌐 Public routes */}
        <Route path="/login" element={<LoginPage />} />
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
  <Route index element={<AdminDashboard />} />
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
