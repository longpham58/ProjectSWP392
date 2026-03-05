import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api/hr';
import { mockDashboardStats } from '@/mocks/hr/dashboard.mock';
import type { HRDashboardStats } from '@/types/hr.types';

export function useDashboardStats() {
  const [stats, setStats] = useState<HRDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    dashboardService
      .getStats()
      .then((res) => {
        if (!cancelled && res?.data) setStats(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setStats(mockDashboardStats);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats: stats ?? mockDashboardStats, loading, error };
}
