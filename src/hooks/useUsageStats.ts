// Hook to fetch and display usage stats
// Location: src/hooks/useUsageStats.ts

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UsageStats {
  prd: { used: number; limit: number };
  code: { used: number; limit: number };
}

export function useUsageStats() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/usage/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch usage stats');
        }
        
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          // Default stats if API doesn't return data
          setStats({
            prd: { used: 0, limit: 20 },
            code: { used: 0, limit: 10 },
          });
        }
      } catch (err: any) {
        console.error('Error fetching usage stats:', err);
        setError(err.message);
        // Set default stats on error
        setStats({
          prd: { used: 0, limit: 20 },
          code: { used: 0, limit: 10 },
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [user, isLoaded]);

  const refresh = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/usage/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error refreshing usage stats:', err);
    }
  };

  return { stats, isLoading, error, refresh };
}

