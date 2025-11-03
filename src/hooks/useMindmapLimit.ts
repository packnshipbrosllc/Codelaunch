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
        const response = await fetch('/api/user/usage', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          const isSubscribed = data.subscription_status === 'active';
          const mindmapsCreated = data.mindmaps_created || 0;
          const freeLimit = 3;

          setLimitData({
            canCreateMore: isSubscribed || mindmapsCreated < freeLimit,
            isSubscribed,
            remainingFreeMindmaps: isSubscribed ? null : Math.max(0, freeLimit - mindmapsCreated),
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

