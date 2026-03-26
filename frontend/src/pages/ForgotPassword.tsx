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
          <h1 className="welcome-title">Đặt lại mật khẩu</h1>
          <p className="welcome-subtitle">Khôi phục tài khoản của bạn</p>

          <div className="icon-wrapper">
            <div className="star star-yellow">*</div>
            <div className="airplane-icon">
              <i className="fas fa-key"></i>
            </div>
            <div className="star star-purple">*</div>
          </div>

          <p className="tagline">Chúng tôi sẽ giúp bạn lấy lại tài khoản</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Quên mật khẩu?</h2>

          <p className="forgot-description">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
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
              Đang chuyển đến trang đặt lại mật khẩu...
            </div>
          )}

          <form onSubmit={handleSendOtp}>
            <div className="input-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
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
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/login" className="link-text">
              <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
