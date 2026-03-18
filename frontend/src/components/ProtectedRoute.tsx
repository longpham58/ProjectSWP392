import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles = [] 
}) => {
  const { user, initialized, fetchMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      if (!initialized) {
        await fetchMe();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [initialized, fetchMe]);

  // Show loading while checking authentication
  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Đang kiểm tra quyền truy cập...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  const userRoles = user.roles || [];
  
  if (requiredRole && !userRoles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(role => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;