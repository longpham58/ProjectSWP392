import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api/hr';
import type { HRDashboardStats } from '@/types/hr.types';

export function useDashboardStats(refreshToken = 0) {
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
        if (!cancelled && res?.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return { stats, loading, error };
}
