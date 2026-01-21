import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { resetPassword, loading, error } = useAuthStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError("Invalid or missing reset token");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
  await resetPassword(token, newPassword);
  console.log("RESET OK");
  setSuccess(true);
} catch (err) {
  console.log("RESET FAILED", err);
}
  };

  if (success) {
    console.log("Render ResetPasswordPage, success =", success);
    return (
      <div className="container">
        <div className="success-message">
          <h2>Password Reset Successful</h2>
          <p>You can now log in with your new password.</p>

          <Link to="/login" className="signin-btn">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-container">
        <h2 className="login-title">Reset Password</h2>

        {(localError || error) && (
          <div className="error-message">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="signin-btn"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="back-to-login">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
