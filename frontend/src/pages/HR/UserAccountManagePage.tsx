import React, { useMemo, useState } from 'react';
import '../../assets/styles/UserAccountManagePage.css';

const MOCK_USERS = [
  { id: 1, userId: 'HR001', fullname: 'Nguyễn Văn A', email: 'anv@gmail.com', role: 'HR', status: 'Active' },
  { id: 2, userId: 'TR002', fullname: 'Trần Thị B', email: 'bt@example.com', role: 'Trainer', status: 'Active' },
  { id: 3, userId: 'EM003', fullname: 'Lê Văn C', email: 'c.le@example.com', role: 'Employee', status: 'Inactive' },
  { id: 4, userId: 'EM004', fullname: 'Phạm Thị D', email: 'd.pham@example.com', role: 'Employee', status: 'Active' },
  { id: 5, userId: 'TR005', fullname: 'Hoàng Văn E', email: 'e.hoang@example.com', role: 'Trainer', status: 'Inactive' },
];

export const UserAccountManagePage: React.FC = () => {
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  const filtered = useMemo(() => {
    const kw = filterKeyword.trim().toLowerCase();
    return MOCK_USERS.filter((u) => {
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus && u.status !== filterStatus) return false;
      if (kw) {
        const hay = `${u.fullname} ${u.email} ${u.userId}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [filterKeyword, filterRole, filterStatus]);

  const stats = useMemo(() => {
    const total = MOCK_USERS.length;
    const active = MOCK_USERS.filter((u) => u.status === 'Active').length;
    const inactive = MOCK_USERS.filter((u) => u.status === 'Inactive').length;
    const trainers = MOCK_USERS.filter((u) => u.role === 'Trainer').length;
    return { total, active, inactive, trainers };
  }, []);

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="user-account-page">
      <div className="ua-topbar">
        <div className="ua-topbar-left">
          <h1 className="user-account-title">Danh sách tài khoản</h1>
          <div className="ua-subtitle">Quản lý người dùng và phân quyền trong hệ thống</div>
        </div>
        <div className="ua-topbar-actions">
          <button type="button" className="ua-action-btn secondary">⬇ Export</button>
          <button type="button" className="ua-action-btn primary">⬆ Import danh sách</button>
        </div>
      </div>

      <div className="ua-stats">
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-green">✓</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.active}</div>
            <div className="ua-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-blue">👤</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.trainers}</div>
            <div className="ua-stat-label">Trainer</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-amber">⏸</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.inactive}</div>
            <div className="ua-stat-label">Tạm ngưng</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-red">∑</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.total}</div>
            <div className="ua-stat-label">Tổng tài khoản</div>
          </div>
        </div>
      </div>

      <div className="ua-toolbar">
        <div className="ua-search">
          <span className="ua-search-icon">🔎</span>
          <input
            id="user-keyword"
            type="text"
            placeholder="Tìm kiếm theo UserID, họ tên, email..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        <div className="ua-filters">
          <select aria-label="Role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tất cả role</option>
            <option value="HR">HR</option>
            <option value="Trainer">Trainer</option>
            <option value="Employee">Employee</option>
          </select>
          <select aria-label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="user-account-table-wrap">
        <table className="user-account-table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Fullname</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.userId}</td>
                <td>
                  <div className="ua-name-cell">
                    <div className="ua-avatar">{initials(u.fullname)}</div>
                    <div className="ua-name-meta">
                      <div className="ua-name">{u.fullname}</div>
                      <div className="ua-id">{u.userId}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><span className={`user-status user-status-${u.status.toLowerCase()}`}>{u.status}</span></td>
                <td>
                  <button type="button" className="user-icon-btn" title="Edit">✎</button>
                  <button type="button" className="user-icon-btn" title="Delete">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
