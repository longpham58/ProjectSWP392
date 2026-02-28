import { useAuthStore } from "../stores/auth.store";
import { HRDashboardPage } from "../pages/HR/HRDashboardPage";

export default function HRLayout() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <HRDashboardPage
      user={{ fullName: user.fullName }}
      onLogout={() => logout()}
    />
  );
}
