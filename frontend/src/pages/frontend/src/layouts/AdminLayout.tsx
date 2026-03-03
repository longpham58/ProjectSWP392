import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside>
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/settings">Settings</NavLink>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}