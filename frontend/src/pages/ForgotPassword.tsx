import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { Link } from "react-router-dom";
import "../assets/styles/LoginPage.css";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
  if (secondsLeft === null || secondsLeft <= 0) return;

  const timer = setInterval(() => {
    setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
  }, 1000);

  return () => clearInterval(timer);
}, [secondsLeft]);

  const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return `${m} phút ${s} giây`;
  return `${s} giây`;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
      setSecondsLeft(15 * 60);
    } catch {}
  };

  return (
    <div className="container">
      {/* LEFT */}
      <div className="left-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Reset Password</h1>
          <p className="welcome-subtitle">Recover Your Account</p>

          <div className="icon-wrapper">
            <div className="star star-yellow">★</div>
            <div className="airplane-icon">
              <i className="fas fa-key"></i>
            </div>
            <div className="star star-purple">★</div>
          </div>

          <p className="tagline">We'll help you get back into your account</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Forgot Password?</h2>

          {!sent ? (
            <>
              <p className="forgot-description">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {/* ERROR */}
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="signin-btn"
                  disabled={loading || !email}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="back-to-login">
                <Link to="/login" className="link-text">
                  <i className="fas fa-arrow-left"></i> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>Reset link has been sent to your email!</p>

              <div className="session-notification">
                <div className="session-icon">
                  <i className="fas fa-info-circle"></i>
                </div>
                <div className="session-text">
                  Link đặt lại mật khẩu có hiệu lực trong  <strong>
    {secondsLeft !== null ? formatTime(secondsLeft) : "15 phút"}
  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
