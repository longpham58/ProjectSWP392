import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";

export default function OtpPage() {
  const { verifyOtp, resendOtp, error, loading } = useAuthStore();
  const [seconds, setSeconds] = useState(60);
   const [otp, setOtp] = useState("");

  const navigate = useNavigate();

 const getHomeByRole = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYEE":
      return "/employee";
    default:
      return "/";
  }
};
  useEffect(() => {
  if (seconds <= 0) return;
  const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
  return () => clearTimeout(timer);
}, [seconds]);

  const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await verifyOtp(otp);
     const { user } = useAuthStore.getState();
     const role = user?.roles?.[0];
    navigate(getHomeByRole(role), { replace: true });
  } catch {}
};

  return (
    <div className="login-container">
      <h2 className="login-title">Xác thực OTP</h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <p className="otp-description">
        Nhập mã 6 chữ số đã được gửi đến email của bạn
      </p>

      <form onSubmit={handleVerify}>
        <div className="input-wrapper">
          <i className="input-icon fas fa-key"></i>
          <input
            type="text"
            placeholder="Mã OTP 6 chữ số"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button
  type="button"
  className="resend-btn"
  onClick={resendOtp}
  disabled={seconds > 0}
>
  Gửi lại OTP {seconds > 0 && `(${seconds}s)`}
</button>

        <button className="signin-btn" type="submit" disabled={loading}>
          {loading ? "Đang xác thực..." : "Xác thực OTP"}
        </button>
      </form>
    </div>
  );
}
