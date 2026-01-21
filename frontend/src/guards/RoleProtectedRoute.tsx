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

  if (!initialized || loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
