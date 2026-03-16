import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForgotPasswordStore } from "../stores/forgotPassword.store";
import "../assets/styles/LoginPage.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  const { loading, error, requestOtp } = useForgotPasswordStore();

  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const successResult = await requestOtp(email);
    if (successResult) {
      // Navigate directly to ResetPasswordPage
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }
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

          <p className="forgot-description">
            Enter your email address and we'll send you an OTP code to reset your password.
          </p>

          {/* ERROR */}
          {error && <div className="error-message">{error}</div>}

          {/* SUCCESS - redirecting message */}
          {success && (
            <div className="success-message" style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '10px', 
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              Redirecting to reset password page...
            </div>
          )}

          <form onSubmit={handleSendOtp}>
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
              disabled={loading || !email || success}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/login" className="link-text">
              <i className="fas fa-arrow-left"></i> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
