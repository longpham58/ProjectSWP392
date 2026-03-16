import { JSX, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ResetPasswordGuardProps {
  children: ReactNode;
}

/**
 * Guard for the reset password page.
 * 
 * The backend uses session-based password reset flow:
 * 1. User requests OTP at /forgot-password
 * 2. User verifies OTP at /forgot-password/verify  
 * 3. Session stores PASSWORD_RESET_USER_ID
 * 4. User accesses /reset-password
 * 
 * This guard allows access - the actual session validation
 * happens on the backend when the form is submitted.
 */
export default function ResetPasswordGuard({ children }: ResetPasswordGuardProps): JSX.Element {
  // Allow access - backend validates session on form submission
  // If session is invalid, backend returns error and frontend shows message
  return <>{children}</>;
}
