import { JSX } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

export default function ResetPasswordGuard({ children }: { children: JSX.Element }) {
  const [params] = useSearchParams();
  const token = params.get("token");
console.log("ResetPasswordGuard token =", token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
