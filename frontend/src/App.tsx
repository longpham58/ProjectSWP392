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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
