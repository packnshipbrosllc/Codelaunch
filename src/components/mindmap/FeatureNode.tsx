// components/mindmap/FeatureNode.tsx
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FeatureNode as FeatureNodeType, STATUS_CONFIG, PRIORITY_CONFIG, COMPLEXITY_CONFIG } from '@/types/feature';

interface FeatureNodeData extends FeatureNodeType['data'] {
  onViewPRD?: (featureId: string) => void;
  onGeneratePRD?: (featureId: string) => void;
}

function FeatureNode({ data, id }: NodeProps<FeatureNodeData>) {
  const status = (data as any).status || 'planned';
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const priorityConfig = PRIORITY_CONFIG[data.priority];
  const complexityConfig = COMPLEXITY_CONFIG[data.complexity];

  return (
    <div className="relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-gray-900"
      />

      {/* Node Content */}
      <div className="min-w-[280px] max-w-[320px] bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/* Status Header */}
        <div className={`px-4 py-2 ${statusConfig.bgColor} border-b border-gray-700`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            {data.dependencies && data.dependencies.length > 0 && (
              <span className="text-xs text-gray-400">
                🔗 {data.dependencies.length} dep{data.dependencies.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-white font-semibold text-base leading-tight">
            {data.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-snug line-clamp-2">
            {data.description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${priorityConfig.color} bg-gray-800`}>
              {priorityConfig.label}
            </span>
            <span className={`px-2 py-1 rounded ${complexityConfig.color} bg-gray-800`}>
              {complexityConfig.label}
            </span>
            {data.estimatedTime && (
              <span className="px-2 py-1 rounded text-gray-300 bg-gray-800">
                ⏱️ {data.estimatedTime}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {data.hasPRD ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onViewPRD?.(id);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  📄 View PRD
                </button>
                {status === 'detailed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle approve PRD action
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    ✅
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onGeneratePRD?.(id);
                }}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors"
              >
                ✨ Generate PRD
              </button>
            )}
          </div>

          {/* Building Progress Indicator */}
          {status === 'building' && (
            <div className="pt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Generating code...</p>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-gray-900"
      />
    </div>
  );
}

export default memo(FeatureNode);

