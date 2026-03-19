import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import "../assets/styles/LoginPage.css";

export default function LoginPage() {
  const { login, loading, error, setError} = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const oauthError = params.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getHomeByRole = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "HR":
        return "/hr";
      case "EMPLOYEE":
        return "/employee";
      case "TRAINER":
        return "/trainer";
      default:
        return "/login";
    }
  };

  const handleGoogleLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/google";
};
  useEffect(() => {
  if (oauthError) {
    setError(
      oauthError === "account_not_registered"
        ? "Your Google account is not registered"
        : "Google login failed"
    );
  }
}, [oauthError]);

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    await login(username, password, rememberMe);

    const { otpRequired, user } = useAuthStore.getState();

     if (otpRequired) {
      navigate("/otp");
      return;
    }
      const role = user?.roles?.[0];
      console.log("Login successful, user:", user, "navigating to home for role:", role);
      const target = getHomeByRole(role);
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
          <h1 className="welcome-title">Welcome to Training Management System</h1>
          <p className="welcome-subtitle">Your Learning Journey Starts Here</p>
          <p className="tagline">Manage your training courses and track your progress</p>
        </div>
      </div>

      <div className="right-section">
        <div className="login-container">
          <h2 className="login-title">Sign In</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-wrapper">
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
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Google Login */}
          <div className="social-login">
            <p className="social-text">Or sign in with</p>
            <div className="social-icons">
              <button className="social-icon google" type="button" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
