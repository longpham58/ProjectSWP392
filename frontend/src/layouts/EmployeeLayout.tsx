import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, BookOpen, Award, CalendarDays,
  Bell, User, LogOut, GraduationCap
} from "lucide-react";

export default function EmployeeLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read avatar from localStorage (same key used in ProfilePage)
  const localAvatar = user?.id ? localStorage.getItem(`avatar_${user.id}`) : null;
  const rawAvatarUrl = (user as any)?.avatarUrl as string | undefined;
  const avatarSrc = localAvatar || (rawAvatarUrl && rawAvatarUrl !== "local" ? rawAvatarUrl : null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { to: "/employee", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/employee/my-courses", end: false, icon: BookOpen, label: "Khóa học của tôi" },
    { to: "/employee/certificates", end: false, icon: Award, label: "Chứng chỉ" },
    { to: "/employee/schedule", end: false, icon: CalendarDays, label: "Lịch học" },
    { to: "/employee/notifications", end: false, icon: Bell, label: "Thông báo" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo — click goes to dashboard */}
            <button
              onClick={() => navigate("/employee")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Training Management</h1>
                <p className="text-xs text-gray-500">Employee Portal</p>
              </div>
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <NavLink
                    to="/employee/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} className="text-gray-400" /> Hồ sơ của tôi
                  </NavLink>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Training Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
