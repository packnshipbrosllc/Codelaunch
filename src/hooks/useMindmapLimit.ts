'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface MindmapLimitData {
  canCreateMore: boolean;
  isSubscribed: boolean;
  remainingFreeMindmaps: number | null;
  mindmapsCreated: number;
  freeLimit: number;
}

export function useMindmapLimit(): MindmapLimitData {
  const { isSignedIn, user } = useUser();
  const [limitData, setLimitData] = useState<MindmapLimitData>({
    canCreateMore: true,
    isSubscribed: false,
    remainingFreeMindmaps: 3,
    mindmapsCreated: 0,
    freeLimit: 3,
  });

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLimitData({
        canCreateMore: false,
        isSubscribed: false,
        remainingFreeMindmaps: null,
        mindmapsCreated: 0,
        freeLimit: 3,
      });
      return;
    }

    // Fetch user's mindmap usage from Supabase
    const fetchLimitData = async () => {
      try {
        // Use check-usage endpoint (simpler, dedicated for this purpose)
        const response = await fetch('/api/check-usage', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          const isSubscribed = data.isProUser;
          const mindmapsCreated = data.mindmapsCreated || 0;
          const freeLimit = typeof data.limit === 'number' ? data.limit : 3;
          const remaining = typeof data.remaining === 'number' ? data.remaining : (freeLimit - mindmapsCreated);

          setLimitData({
            canCreateMore: isSubscribed || mindmapsCreated < freeLimit,
            isSubscribed,
            remainingFreeMindmaps: isSubscribed ? null : Math.max(0, remaining),
            mindmapsCreated,
            freeLimit,
          });
        } else {
          // Default to free tier if fetch fails
          setLimitData({
            canCreateMore: true,
            isSubscribed: false,
            remainingFreeMindmaps: 3,
            mindmapsCreated: 0,
            freeLimit: 3,
          });
        }
      } catch (error) {
        console.error('Error fetching mindmap limit:', error);
        // Default to free tier on error
        setLimitData({
          canCreateMore: true,
          isSubscribed: false,
          remainingFreeMindmaps: 3,
          mindmapsCreated: 0,
          freeLimit: 3,
        });
      }
    };

    fetchLimitData();
  }, [isSignedIn, user]);

  return limitData;
}

