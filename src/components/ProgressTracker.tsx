// components/ProgressTracker.tsx
'use client';

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
  const decisionCount = Object.keys(decisions).length;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-gray-900 via-gray-900/98 to-gray-900/95 shadow-2xl z-40 border-b-2 border-purple-500/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-lg">🎯</span>
              <div>
                <div className="font-bold text-white text-lg">
                  Building Your Custom App
                </div>
                <div className="text-sm text-gray-400">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {percentage}%
              </div>
              <div className="text-xs text-gray-400 font-semibold">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 h-full rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Decision summary */}
        {decisionCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(decisions).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-purple-500/30 shadow-lg backdrop-blur-sm"
              >
                <span className="text-green-400">✓</span>
                <span>{formatDecisionKey(key)}: <span className="text-white">{value}</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDecisionKey(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Ecom', '')
    .replace('Saas', '')
    .trim();
}
