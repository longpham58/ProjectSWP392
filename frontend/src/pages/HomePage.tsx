import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

function HomePage() {
  const { user } = useAuthStore();

  return (
    <div style={{ padding: "24px" }}>
      {/* HERO */}
      <header style={{ marginBottom: "40px" }}>
        <h1>Internal Training Management System</h1>
        <p>
          Learn. Grow. Get certified.  
          Centralized training for employees and trainers.
        </p>

        {!user && (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </header>

      {/* FEATURED COURSES */}
      <section style={{ marginBottom: "32px" }}>
        <h2>🎓 Featured Courses</h2>
        <div style={{ display: "flex", gap: "16px" }}>
          <CourseCard title="Java Spring Boot" />
          <CourseCard title="React for Enterprise" />
          <CourseCard title="System Design Basics" />
        </div>
      </section>

      {/* UPCOMING SESSIONS */}
      <section style={{ marginBottom: "32px" }}>
        <h2>📅 Upcoming Sessions</h2>
        <ul>
          <li>Spring Security – Feb 10</li>
          <li>Docker for Developers – Feb 15</li>
          <li>Clean Architecture – Feb 20</li>
        </ul>
      </section>

      {/* PROMOTIONS */}
      <section style={{ marginBottom: "32px" }}>
        <h2>🔥 Promotions</h2>
        <p>✔ Free certification exam for Q1 trainees</p>
        <p>✔ Priority training for new employees</p>
      </section>

      {/* EMPLOYMENT NEWS */}
      <section>
        <h2>📰 Employment & Skill Targets</h2>
        <ul>
          <li>2026 Goal: 80% staff certified</li>
          <li>Focus on Cloud & Security skills</li>
          <li>Trainer hiring opens in March</li>
        </ul>
      </section>

      {/* PERSONALIZED MESSAGE */}
      {user && (
        <section style={{ marginTop: "40px" }}>
          <h2>👋 Welcome back, {user.fullName}</h2>
          <p>You have new training notifications.</p>
        </section>
      )}
    </div>
  );
}

export default HomePage;

// =====================
// Small reusable card
// =====================
function CourseCard({ title }: { title: string }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "8px",
        width: "200px",
      }}
    >
      <h4>{title}</h4>
      <p>Short description here</p>
    </div>
  );
}
