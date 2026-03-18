import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleGoHome = () => {
    const role = user?.roles?.[0];
    switch (role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'HR':
        navigate('/hr');
        break;
      case 'TRAINER':
        navigate('/trainer');
        break;
      case 'EMPLOYEE':
        navigate('/employee');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Về trang chủ
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
          >
            Đăng xuất
          </button>
        </div>
        
        {user && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
            Đăng nhập với tài khoản: <span className="font-medium">{user.username}</span>
            <br />
            Vai trò: <span className="font-medium">{user.roles?.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;