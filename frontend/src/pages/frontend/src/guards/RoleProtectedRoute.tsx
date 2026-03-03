import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../stores/auth.store";

interface Props {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: Props) {
  const { user, loading, initialized } = useAuthStore();
  
  
  if (loading || !initialized) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!user.roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
