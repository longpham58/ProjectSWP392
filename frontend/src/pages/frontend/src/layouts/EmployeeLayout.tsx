import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export default function EmployeeLayout() {
  const { user } = useAuthStore();

  return (
    <div className="employee-layout">
      <header>
        <h2>Employee Portal</h2>
        <span>{user?.email}</span>
      </header>

      <nav>
        <NavLink to="/employee">Dashboard</NavLink>
        <NavLink to="/employee/profile">My Profile</NavLink>
        <NavLink to="/employee/tasks">My Tasks</NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}