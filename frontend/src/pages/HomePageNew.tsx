import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import "../assets/styles/HomePage.css";

function HomePageNew() {
  const { user } = useAuthStore();

  return (
    <div className="homepage-container">
      {/* NAVIGATION */}
      <nav className="homepage-nav">
        <div className="nav-content">
          <div className="nav-logo">ITMS</div>
          {!user && (
            <Link to="/login">
              <button className="nav-login-btn">Login</button>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">
          Internal Training Management System
        </h1>
        <p className="hero-subtitle">
          Learn. Grow. Get certified.<br />
          Centralized training for employees and trainers.
        </p>
        {!user && (
          <div className="hero-cta">
            <Link to="/login">
              <button className="cta-button cta-primary">Get Started</button>
            </Link>
            <button className="cta-button cta-secondary">Learn More</button>
          </div>
        )}
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-number">500+</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">2,000+</div>
          <div className="stat-label">Employees Trained</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-number">95%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">4.8/5</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="courses-section">
        <div className="section-header">
          <h2 className="section-title">🎓 Featured Courses</h2>
          <p className="section-subtitle">
            Explore our most popular training programs
          </p>
        </div>
        <div className="courses-grid">
          <div className="course-card">
            <div className="course-image">☕</div>
            <div className="course-content">
              <h3 className="course-title">Java Spring Boot</h3>
              <p className="course-description">
                Master enterprise Java development with Spring Boot framework and best practices.
              </p>
              <div className="course-meta">
                <span className="course-duration">⏱️ 40 hours</span>
                <span className="course-level">📊 Advanced</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-image">⚛️</div>
            <div className="course-content">
              <h3 className="course-title">React for Enterprise</h3>
              <p className="course-description">
                Build scalable enterprise applications with React, TypeScript, and modern tools.
              </p>
              <div className="course-meta">
                <span className="course-duration">⏱️ 35 hours</span>
                <span className="course-level">📊 Intermediate</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-image">🏗️</div>
            <div className="course-content">
              <h3 className="course-title">System Design Basics</h3>
              <p className="course-description">
                Learn to design scalable, reliable, and maintainable distributed systems.
              </p>
              <div className="course-meta">
                <span className="course-duration">⏱️ 30 hours</span>
                <span className="course-level">📊 Advanced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING SESSIONS */}
      <section className="sessions-section">
        <div className="section-header">
          <h2 className="section-title">📅 Upcoming Sessions</h2>
          <p className="section-subtitle">
            Don't miss these upcoming training sessions
          </p>
        </div>
        <div className="sessions-grid">
          <div className="session-card">
            <div className="session-date">
              <span className="session-day">10</span>
              <span className="session-month">Feb</span>
            </div>
            <div className="session-info">
              <h3 className="session-title">Spring Security</h3>
              <p className="session-time">⏰ 9:00 AM - 12:00 PM</p>
              <p className="session-instructor">👨‍🏫 Instructor: John Doe</p>
            </div>
          </div>

          <div className="session-card">
            <div className="session-date">
              <span className="session-day">15</span>
              <span className="session-month">Feb</span>
            </div>
            <div className="session-info">
              <h3 className="session-title">Docker for Developers</h3>
              <p className="session-time">⏰ 2:00 PM - 5:00 PM</p>
              <p className="session-instructor">👨‍🏫 Instructor: Jane Smith</p>
            </div>
          </div>

          <div className="session-card">
            <div className="session-date">
              <span className="session-day">20</span>
              <span className="session-month">Feb</span>
            </div>
            <div className="session-info">
              <h3 className="session-title">Clean Architecture</h3>
              <p className="session-time">⏰ 10:00 AM - 1:00 PM</p>
              <p className="session-instructor">👨‍🏫 Instructor: Mike Johnson</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      <section className="promotions-section">
        <div className="section-header">
          <h2 className="section-title">🔥 Special Promotions</h2>
          <p className="section-subtitle">
            Take advantage of these limited-time offers
          </p>
        </div>
        <div className="promotions-grid">
          <div className="promo-card">
            <div className="promo-icon">🎓</div>
            <h3 className="promo-title">Free Certification</h3>
            <p className="promo-description">
              Get free certification exam for all Q1 trainees who complete their courses.
            </p>
          </div>

          <div className="promo-card">
            <div className="promo-icon">⚡</div>
            <h3 className="promo-title">Priority Training</h3>
            <p className="promo-description">
              New employees get priority access to essential training programs.
            </p>
          </div>

          <div className="promo-card">
            <div className="promo-icon">🎯</div>
            <h3 className="promo-title">Career Path</h3>
            <p className="promo-description">
              Personalized learning paths designed for your career growth.
            </p>
          </div>
        </div>
      </section>

      {/* EMPLOYMENT NEWS */}
      <section className="news-section">
        <div className="section-header">
          <h2 className="section-title">📰 Employment & Skill Targets</h2>
          <p className="section-subtitle">
            Stay updated with our latest goals and initiatives
          </p>
        </div>
        <div className="news-container">
          <div className="news-list">
            <div className="news-item">
              <div className="news-icon">🎯</div>
              <div className="news-content">
                <h3 className="news-title">2026 Goal: 80% Staff Certified</h3>
                <p className="news-description">
                  We're committed to ensuring 80% of our staff achieves professional certification by end of 2026.
                </p>
              </div>
            </div>

            <div className="news-item">
              <div className="news-icon">☁️</div>
              <div className="news-content">
                <h3 className="news-title">Focus on Cloud & Security Skills</h3>
                <p className="news-description">
                  Expanding our training programs to include advanced cloud computing and cybersecurity courses.
                </p>
              </div>
            </div>

            <div className="news-item">
              <div className="news-icon">👨‍🏫</div>
              <div className="news-content">
                <h3 className="news-title">Trainer Hiring Opens in March</h3>
                <p className="news-description">
                  We're looking for experienced trainers to join our team. Applications open March 1st.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONALIZED WELCOME (for logged-in users) */}
      {user && (
        <section className="welcome-section">
          <h2 className="welcome-title">👋 Welcome back, {user.fullName}!</h2>
          <p className="welcome-message">
            You have new training notifications waiting for you.
          </p>
        </section>
      )}
    </div>
  );
}

export default HomePageNew;
