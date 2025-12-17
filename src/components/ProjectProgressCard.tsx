// Project Progress Card Component
// Location: src/components/ProjectProgressCard.tsx

'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { useFeatureProgress } from '@/hooks/useFeatureProgress';

interface ProjectProgressCardProps {
  mindmapId: string | undefined;
  features: any[];
  projectName: string;
}

export function ProjectProgressCard({ mindmapId, features, projectName }: ProjectProgressCardProps) {
  const { featureProgress, isLoading } = useFeatureProgress(mindmapId, features);

  if (!features || features.length === 0) return null;

  // Calculate progress
  const totalFeatures = features.length;
  const completedFeatures = features.filter(f => {
    const progress = featureProgress[f.id] || featureProgress[`feature-${f.id}`];
    return progress?.hasPrd && progress?.hasCode;
  }).length;
  
  const inProgressFeatures = features.filter(f => {
    const progress = featureProgress[f.id] || featureProgress[`feature-${f.id}`];
    return progress?.hasPrd && !progress?.hasCode;
  }).length;
  
  const notStartedFeatures = totalFeatures - completedFeatures - inProgressFeatures;
  const progressPercent = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl">
      <h3 className="text-white font-bold text-sm mb-3">Project Progress</h3>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{progressPercent}%</span>
          <span className="text-xs text-gray-400">{completedFeatures}/{totalFeatures} features complete</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Ready to export</span>
          </div>
          <span className="text-white font-semibold">{completedFeatures}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">In progress</span>
          </div>
          <span className="text-white font-semibold">{inProgressFeatures}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-500" />
            <span className="text-gray-300">Not started</span>
          </div>
          <span className="text-white font-semibold">{notStartedFeatures}</span>
        </div>
      </div>
    </div>
  );
}

