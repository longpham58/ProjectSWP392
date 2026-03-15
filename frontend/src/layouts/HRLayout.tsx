import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { HRDashboardPage } from "../pages/hr/HRDashboard";

export default function HRLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <HRDashboardPage
      user={{ fullName: user.fullName }}
      onLogout={handleLogout}
    />
  );
}
