import { Outlet, NavLink, useNavigate } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import "../assets/styles/TrainerDashboard.css"; // 🔥 Use trainer layout styles for admin as well

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate("/login");
    };

  const getNavClass: NavLinkProps["className"] = ({ isActive }) =>
    isActive ? "nav-btn active" : "nav-btn";

  return (
    <div className="trainer-layout"> {/* 🔥 use trainer layout */}

      {/* ================= HEADER ================= */}
      <header className="trainer-header">
        <div className="header-left">
          <h1 className="header-title">Training Management - Admin Portal</h1>
        </div>

        <div className="header-right">
          <span className="user-name">
            👋 {user?.fullName}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="trainer-main"> {/* was admin-body */}
          <div className="trainer-dashboard">
        {/* ========== SIDEBAR ========== */}
        <aside className="trainer-sidebar">
          <div className="trainer-profile">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">
              {user?.fullName}
            </div>
          </div>

          <nav className="trainer-nav">
            <NavLink to="dashboard" className={getNavClass}>
              📊 Dashboard
            </NavLink>

            <NavLink to="users" className={getNavClass}>
              👥 Manage Users
            </NavLink>

            <NavLink to="courses" className={getNavClass}>
              📚 Manage Courses
            </NavLink>

            <NavLink to="analytics" className={getNavClass}>
              📈 Analytics
            </NavLink>

            <NavLink to="notifications" className={getNavClass}>
              🔔 Notifications
            </NavLink>

            <NavLink to="system-activities" className={getNavClass}>
              📝 System Activities
            </NavLink>

            <NavLink to="feedback" className={getNavClass}>
              💬 System Feedback
            </NavLink>
          </nav>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <main className="trainer-content">
          <Outlet />
        </main>
</div>
      </div>
    </div>
  );
}