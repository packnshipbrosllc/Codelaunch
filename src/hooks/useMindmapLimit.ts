'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { trackFreeLimitReached } from '@/utils/analytics';

interface MindmapLimitData {
  canCreateMore: boolean;
  isSubscribed: boolean;
  remainingFreeMindmaps: number | null;
  mindmapsCreated: number;
  freeLimit: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>; // Allow manual refresh after creating mindmap
}

export function useMindmapLimit(): MindmapLimitData {
  const { isSignedIn, user } = useUser();
  const [limitData, setLimitData] = useState<MindmapLimitData>({
    canCreateMore: true,
    isSubscribed: false,
    remainingFreeMindmaps: 3,
    mindmapsCreated: 0,
    freeLimit: 3,
    isLoading: true,
    error: null,
    refresh: async () => {},
  });
  const [hasTrackedLimit, setHasTrackedLimit] = useState(false);

  const fetchLimitData = useCallback(async () => {
    if (!isSignedIn || !user) {
      setLimitData({
        canCreateMore: false,
        isSubscribed: false,
        remainingFreeMindmaps: null,
        mindmapsCreated: 0,
        freeLimit: 3,
        isLoading: false,
        error: null,
        refresh: fetchLimitData,
      });
      return;
    }

    setLimitData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/check-usage', {
        method: 'GET',
        cache: 'no-store', // Always get fresh data
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const isSubscribed = data.isProUser;
      const mindmapsCreated = data.mindmapsCreated || 0;
      const freeLimit = typeof data.limit === 'number' ? data.limit : 3;
      const remaining = typeof data.remaining === 'number' ? data.remaining : (freeLimit - mindmapsCreated);

      const canCreateMore = isSubscribed || mindmapsCreated < freeLimit;

      // Track when user hits their limit (only once per session)
      if (!canCreateMore && !isSubscribed && !hasTrackedLimit) {
        trackFreeLimitReached(mindmapsCreated, freeLimit);
        setHasTrackedLimit(true);
      }

      setLimitData({
        canCreateMore,
        isSubscribed,
        remainingFreeMindmaps: isSubscribed ? null : Math.max(0, remaining),
        mindmapsCreated,
        freeLimit,
        isLoading: false,
        error: null,
        refresh: fetchLimitData,
      });
    } catch (error) {
      console.error('Error fetching mindmap limit:', error);
      
      // IMPORTANT: On error, be conservative - block creation to prevent abuse
      // Better to show an error than accidentally bypass paywall
      setLimitData({
        canCreateMore: false,
        isSubscribed: false,
        remainingFreeMindmaps: 0,
        mindmapsCreated: 0,
        freeLimit: 3,
        isLoading: false,
        error: 'Failed to check usage limits. Please refresh the page.',
        refresh: fetchLimitData,
      });
    }
  }, [isSignedIn, user, hasTrackedLimit]);

  useEffect(() => {
    fetchLimitData();
  }, [fetchLimitData]);

  return limitData;
}
