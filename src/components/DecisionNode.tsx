// components/DecisionNode.tsx
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '@/types/decision-tree';

interface DecisionNodeData {
  label: string;
  description?: string;
  category?: string;
  nodeType: NodeType;
  isClickable: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  selectedValue?: string;
  onClick?: () => void;
}

function DecisionNode({ data }: NodeProps<DecisionNodeData>) {
  const {
    label,
    description,
    category,
    nodeType,
    isClickable,
    isCompleted,
    isLocked,
    selectedValue,
    onClick
  } = data;

  const getNodeStyles = () => {
    if (isLocked) {
      return 'bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed backdrop-blur-sm';
    }
    if (isCompleted) {
      return 'bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500 text-white shadow-2xl shadow-green-500/30 backdrop-blur-sm';
    }
    if (isClickable) {
      return 'bg-gradient-to-br from-purple-900/90 to-purple-700/90 border-purple-400 text-white cursor-pointer hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm animate-pulse-subtle';
    }
    return 'bg-gray-900/80 border-gray-600 text-gray-300 backdrop-blur-sm';
  };

  const getIcon = () => {
    if (isLocked) return '🔒';
    if (isCompleted) return '✅';
    if (isClickable) return '👆';
    if (nodeType === 'info') return '💡';
    if (nodeType === 'generate') return '🚀';
    return '⭕';
  };

  return (
    <div
      className={`px-6 py-5 rounded-2xl border-2 min-w-[220px] max-w-[300px] ${getNodeStyles()}`}
      onClick={isClickable ? onClick : undefined}
      style={{
        boxShadow: isCompleted 
          ? '0 0 30px rgba(34, 197, 94, 0.3)' 
          : isClickable 
          ? '0 0 30px rgba(147, 51, 234, 0.4)' 
          : 'none'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-purple-500 border-2 border-purple-300" 
      />
      
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0 drop-shadow-lg">{getIcon()}</span>
        <div className="flex-1">
          {category && (
            <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1.5 text-purple-300">
              {category}
            </div>
          )}
          <div className="font-bold text-base mb-1.5 leading-tight">{label}</div>
          {description && (
            <div className="text-xs opacity-80 line-clamp-2 leading-relaxed">{description}</div>
          )}
          {selectedValue && isCompleted && (
            <div className="mt-2 px-3 py-1.5 bg-green-500/30 rounded-lg text-xs font-bold border border-green-400/50">
              ✓ {selectedValue}
            </div>
          )}
          {isClickable && (
            <div className="mt-3 text-xs font-bold text-purple-300 flex items-center gap-1 animate-bounce">
              <span>Click to choose</span>
              <span>→</span>
            </div>
          )}
          {isCompleted && !selectedValue && (
            <div className="mt-2 text-xs font-bold text-green-300">
              ✓ Completed
            </div>
          )}
          {isLocked && (
            <div className="mt-2 text-xs font-semibold text-gray-500">
              Complete previous steps
            </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-purple-500 border-2 border-purple-300" 
      />
    </div>
  );
}

export default memo(DecisionNode);
