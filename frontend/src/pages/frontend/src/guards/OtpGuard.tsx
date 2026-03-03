import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { JSX } from "react";

export default function OtpGuard({ children }: { children: JSX.Element }) {
  const { otpRequired } = useAuthStore();

  if (!otpRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
}