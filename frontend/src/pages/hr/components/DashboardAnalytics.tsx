import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatCard } from '@/components/ui';
import '@/assets/styles/ui-components.css';

export const DashboardAnalytics: React.FC = () => {
  const { stats: s, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="hr-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="hr-stat-card" style={{ opacity: 0.6 }}>
            <div className="hr-stat-value">--</div>
            <div className="hr-stat-label">Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hr-stats">
      <StatCard title="Tổng khoá học" value={s.totalCourses} icon="📚" variant="blue" />
      <StatCard title="Tổng lịch học" value={s.totalSchedules} icon="🗓" variant="green" />
      <StatCard title="Tổng thông báo" value={s.totalNotifications} icon="🔔" variant="amber" />
      <StatCard title="Trainer" value={s.totalTrainers} icon="👤" variant="red" />
    </div>
  );
};
