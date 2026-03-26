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
      setLocalError("Email bị thiếu. Vui lòng bắt đầu lại quá trình quên mật khẩu.");
      return;
    }

    if (otp.length !== 6) {
      setLocalError("Vui lòng nhập mã OTP hợp lệ gồm 6 chữ số");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Mật khẩu không khớp");
      return;
    }

    // First verify OTP
    const otpSuccess = await verifyOtp(email, otp);
    if (!otpSuccess) {
      setLocalError(error || "Mã OTP không hợp lệ");
      return;
    }

    setOtpVerified(true);

    // Then reset password
    const passwordSuccess = await resetPassword(newPassword);
    if (passwordSuccess) {
      setSuccess(true);
    } else {
      setLocalError(error || "Đặt lại mật khẩu thất bại");
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="left-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Thành công!</h1>
            <p className="welcome-subtitle">Đặt lại mật khẩu hoàn tất</p>
            <div className="icon-wrapper">
              <div className="star star-yellow">*</div>
              <div className="airplane-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="star star-purple">*</div>
            </div>
            <p className="tagline">Mật khẩu của bạn đã được đặt lại thành công</p>
          </div>
        </div>
        <div className="right-section">
          <div className="login-container">
            <div className="success-message">
              <h2>Đặt lại mật khẩu thành công</h2>
              <p>Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Link to="/login" className="signin-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Đến trang đăng nhập
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
          <h1 className="welcome-title">Đặt lại mật khẩu</h1>
          <p className="welcome-subtitle">Tạo mật khẩu mới</p>

          <div className="icon-wrapper">
            <div className="star star-yellow">*</div>
            <div className="airplane-icon">
              <i className="fas fa-lock"></i>
            </div>
            <div className="star star-purple">*</div>
          </div>

          <p className="tagline">Nhập OTP và mật khẩu mới bên dưới</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Đặt lại mật khẩu</h2>
          
          {email && (
            <p className="forgot-description">
              Đặt lại mật khẩu cho: <strong>{email}</strong>
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
                placeholder="Nhập mã OTP 6 chữ số"
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
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
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
              {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/forgot-password" className="link-text">
              <i className="fas fa-arrow-left"></i> Bắt đầu lại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
