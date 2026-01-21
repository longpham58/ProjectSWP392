import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/LoginPage.css";

export default function LoginPage() {
  const { login, loading, error, setError, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const oauthError = params.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
  if (oauthError) {
    setError(
      oauthError === "account_not_registered"
        ? "Your Google account is not registered"
        : "Google login failed"
    );
  }
}, [oauthError]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    await login(username, password, rememberMe);

    const { otpRequired } = useAuthStore.getState();

     if (otpRequired) {
      navigate("/otp");
    }

      const target = getHomeByRole(user?.role);
      navigate(target, { replace: true });
  } catch {
    // ❌ Do nothing
    // Error is already stored in Zustand (error state)
  }
  };

  return (
    <div className="container">
      <div className="left-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to Room</h1>
          <p className="welcome-subtitle">Your Learning Starts Here</p>
          <p className="tagline">Step into your room</p>
        </div>
      </div>

      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Sign In</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* Forgot */}
            <div className="links-row">
              <a href="/forgot-password" className="link-text">
                Forgot Password?
              </a>
            </div>

            {/* Remember Me */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div className="checkbox-content">
                <span className="checkbox-title">Remember me</span>
              </div>
            </label>

            {/* Submit */}
            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}{" "}
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>

          {/* Google Login */}
          <div className="social-login">
            <p className="social-text">Or sign in with</p>
            <div className="social-icons">
              <a
                href={`${import.meta.env.VITE_API_URL}/oauth2/authorization/google`}
                className="social-icon google"
              >
                Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
