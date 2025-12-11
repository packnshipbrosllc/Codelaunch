// Progress Bar Component - Shows workflow stages
// Location: src/components/ProgressBar.tsx

'use client';

import { Lightbulb, GitBranch, FileText, Code, Download, Check } from 'lucide-react';
import { MindmapData } from '@/types/mindmap';

export type WorkflowStage = 'idea' | 'mindmap' | 'prd' | 'code' | 'export';

interface StageConfig {
  id: WorkflowStage;
  label: string;
  icon: React.ReactNode;
  hint: string;
}

const stages: StageConfig[] = [
  { 
    id: 'idea', 
    label: 'Idea', 
    icon: <Lightbulb className="w-4 h-4" />,
    hint: 'Describe your app idea to get started'
  },
  { 
    id: 'mindmap', 
    label: 'Mindmap', 
    icon: <GitBranch className="w-4 h-4" />,
    hint: 'Click a feature to generate PRD →'
  },
  { 
    id: 'prd', 
    label: 'PRD', 
    icon: <FileText className="w-4 h-4" />,
    hint: 'Generate code from your PRD →'
  },
  { 
    id: 'code', 
    label: 'Code', 
    icon: <Code className="w-4 h-4" />,
    hint: 'Export your project files →'
  },
  { 
    id: 'export', 
    label: 'Export', 
    icon: <Download className="w-4 h-4" />,
    hint: 'Download your complete project!'
  },
];

interface ProgressResult {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
}

export function calculateProgress(mindmapData: MindmapData | null): ProgressResult {
  if (!mindmapData) {
    return { currentStage: 'idea', completedStages: [] };
  }

  const completedStages: WorkflowStage[] = ['idea'];
  let currentStage: WorkflowStage = 'mindmap';

  // Check if we have a mindmap
  if (mindmapData.features && mindmapData.features.length > 0) {
    completedStages.push('mindmap');
    currentStage = 'mindmap';

    // Check if any features have PRDs
    const hasPRD = mindmapData.features.some(
      (f: any) => f.hasPRD || f.prd
    );
    
    if (hasPRD) {
      completedStages.push('prd');
      currentStage = 'prd';

      // Check if any features have generated code
      const hasCode = mindmapData.features.some(
        (f: any) => f.hasCode || f.generatedCode
      );
      
      if (hasCode) {
        completedStages.push('code');
        currentStage = 'code';
      }
    }
  }

  return { currentStage, completedStages };
}

interface ProgressBarProps {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
}

export default function ProgressBar({ currentStage, completedStages }: ProgressBarProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  const progressPercentage = Math.round(((currentIndex + 1) / stages.length) * 100);
  const currentHint = stages.find(s => s.id === currentStage)?.hint || '';

  return (
    <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
      {/* Stages */}
      <div className="flex items-center justify-between relative">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = stage.id === currentStage;
          const isPast = index < currentIndex;
          
          return (
            <div key={stage.id} className="flex items-center flex-1">
              {/* Stage Circle */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted && !isCurrent
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/20'
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stage.icon
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors
                    ${isCurrent ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-gray-500'}
                  `}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-6">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-500
                      ${isPast || (isCompleted && index < currentIndex)
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gray-700'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Info */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {progressPercentage}%
          </span>
        </div>
        
        {currentHint && (
          <p className="text-xs text-purple-400 font-medium animate-pulse">
            {currentHint}
          </p>
        )}
      </div>
    </div>
  );
}

