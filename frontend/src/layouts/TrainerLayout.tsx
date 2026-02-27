import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function TrainerLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="trainer-layout">
      <header className="trainer-header">
        <div className="header-left">
          <h1>ITMS - Trainer Portal</h1>
        </div>
        <div className="header-right">
          <span className="user-name">👋 {user?.fullName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="trainer-main">
        <Outlet />
      </main>
    </div>
  );
}
