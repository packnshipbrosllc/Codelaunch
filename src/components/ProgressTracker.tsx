// components/ProgressTracker.tsx
'use client';

import { CheckCircle2 } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  decisions: Record<string, string>;
}

export default function ProgressTracker({
  currentStep,
  totalSteps,
  percentage,
  decisions
}: ProgressTrackerProps) {
  const completedSteps = Object.keys(decisions).length;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Completed decisions pills */}
        {completedSteps > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(decisions).map(([key, value]) => (
              <div
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span className="capitalize">{key.replace(/-/g, ' ')}</span>
                <span className="text-purple-500">:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

