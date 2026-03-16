import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForgotPasswordStore } from "../stores/forgotPassword.store";
import "../assets/styles/LoginPage.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const { loading, error, verifyOtp, resetPassword, resetState, clearError, secondsLeft, setSecondsLeft } = useForgotPasswordStore();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, setSecondsLeft]);

  useEffect(() => {
    // Reset state when component mounts
    return () => {
      resetState();
    };
  }, [resetState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m} phút ${s} giây`;
    return `${s} giây`;
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email) {
      setLocalError("Email is missing. Please start the forgot password process again.");
      return;
    }

    if (otp.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
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

    // First verify OTP
    const otpSuccess = await verifyOtp(email, otp);
    if (!otpSuccess) {
      setLocalError(error || "Invalid OTP");
      return;
    }

    setOtpVerified(true);

    // Then reset password
    const passwordSuccess = await resetPassword(newPassword);
    if (passwordSuccess) {
      setSuccess(true);
    } else {
      setLocalError(error || "Failed to reset password");
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Success!</h1>
            <p className="welcome-subtitle">Password Reset Complete</p>
            <div className="icon-wrapper">
              <div className="star star-yellow">★</div>
              <div className="airplane-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="star star-purple">★</div>
            </div>
            <p className="tagline">Your password has been reset successfully</p>
          </div>
        </div>
        <div className="right-section">
          <div className="login-container">
            <div className="success-message">
              <h2>Password Reset Successful</h2>
              <p>You can now log in with your new password.</p>
              <Link to="/login" className="signin-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* LEFT */}
      <div className="left-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Reset Password</h1>
          <p className="welcome-subtitle">Create New Password</p>

          <div className="icon-wrapper">
            <div className="star star-yellow">★</div>
            <div className="airplane-icon">
              <i className="fas fa-lock"></i>
            </div>
            <div className="star star-purple">★</div>
          </div>

          <p className="tagline">Enter OTP and new password below</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Reset Password</h2>
          
          {email && (
            <p className="forgot-description">
              Resetting password for: <strong>{email}</strong>
            </p>
          )}

          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleVerifyAndReset}>
            <div className="input-wrapper">
              <i className="fas fa-key input-icon"></i>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>

            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
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
              disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/forgot-password" className="link-text">
              <i className="fas fa-arrow-left"></i> Start Over
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
