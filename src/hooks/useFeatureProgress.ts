// Hook to track feature completion progress
// Location: src/hooks/useFeatureProgress.ts

'use client';

import { useState, useEffect } from 'react';

export interface FeatureProgress {
  hasPrd: boolean;
  hasCode: boolean;
  prdUpdatedAt?: string;
  codeUpdatedAt?: string;
}

export interface FeatureProgressMap {
  [featureId: string]: FeatureProgress;
}

export function useFeatureProgress(mindmapId: string | undefined, features: any[]) {
  const [featureProgress, setFeatureProgress] = useState<FeatureProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      if (!mindmapId || !features || features.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch all PRDs and code for all features in one batch
        const featureIds = features.map(f => f.id || f.featureId).filter(Boolean);
        
        if (featureIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch PRDs
        const prdPromises = featureIds.map(async (featureId) => {
          try {
            const response = await fetch(`/api/features/${featureId}/prd-code?mindmapId=${mindmapId}`);
            if (response.ok) {
              const data = await response.json();
              return {
                featureId,
                hasPrd: !!data.prd,
                hasCode: !!data.code,
                prdUpdatedAt: data.prdUpdatedAt || undefined,
                codeUpdatedAt: data.codeUpdatedAt || undefined,
              };
            }
          } catch (error) {
            console.error(`Error fetching progress for feature ${featureId}:`, error);
          }
          return {
            featureId,
            hasPrd: false,
            hasCode: false,
          };
        });

        const results = await Promise.all(prdPromises);
        
        const progressMap: FeatureProgressMap = {};
        results.forEach(result => {
          progressMap[result.featureId] = {
            hasPrd: result.hasPrd,
            hasCode: result.hasCode,
            prdUpdatedAt: result.prdUpdatedAt,
            codeUpdatedAt: result.codeUpdatedAt,
          };
        });

        setFeatureProgress(progressMap);
      } catch (error) {
        console.error('Error fetching feature progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, [mindmapId, features]);

  const refresh = async () => {
    if (!mindmapId || !features || features.length === 0) return;
    
    // Re-fetch progress
    const featureIds = features.map(f => f.id || f.featureId).filter(Boolean);
    
    if (featureIds.length === 0) return;

    const prdPromises = featureIds.map(async (featureId) => {
      try {
        const response = await fetch(`/api/features/${featureId}/prd-code?mindmapId=${mindmapId}`);
        if (response.ok) {
          const data = await response.json();
          return {
            featureId,
            hasPrd: !!data.prd,
            hasCode: !!data.code,
            prdUpdatedAt: data.prdUpdatedAt || undefined,
            codeUpdatedAt: data.codeUpdatedAt || undefined,
          };
        }
      } catch (error) {
        console.error(`Error refreshing progress for feature ${featureId}:`, error);
      }
      return {
        featureId,
        hasPrd: false,
        hasCode: false,
      };
    });

    const results = await Promise.all(prdPromises);
    
    const progressMap: FeatureProgressMap = {};
    results.forEach(result => {
      progressMap[result.featureId] = {
        hasPrd: result.hasPrd,
        hasCode: result.hasCode,
        prdUpdatedAt: result.prdUpdatedAt,
        codeUpdatedAt: result.codeUpdatedAt,
      };
    });

    setFeatureProgress(progressMap);
  };

  return { featureProgress, isLoading, refresh };
}

