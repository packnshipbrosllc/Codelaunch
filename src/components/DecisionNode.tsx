// components/DecisionNode.tsx
'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface DecisionNodeData {
  label: string;
  description?: string;
  category?: string;
  nodeType: 'decision' | 'completed' | 'locked' | 'info' | 'generate';
  isClickable: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick?: () => void;
}

export default function DecisionNode({ data }: NodeProps<DecisionNodeData>) {
  const { 
    label, 
    description, 
    category, 
    nodeType, 
    isClickable, 
    isCompleted, 
    isLocked,
    onClick 
  } = data;

  const isGenerate = nodeType === 'generate';

  return (
    <div className="relative">
      {/* Input handle */}
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      {/* Node content */}
      <div
        onClick={isClickable && !isLocked ? onClick : undefined}
        className={`
          min-w-[200px] max-w-[280px] p-4 rounded-xl shadow-lg border-2 transition-all
          ${isGenerate 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 hover:border-green-300 cursor-pointer' 
            : isCompleted
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400'
            : isLocked
            ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50'
            : isClickable
            ? 'bg-gradient-to-br from-purple-400 to-purple-500 border-purple-300 hover:border-purple-200 hover:shadow-xl cursor-pointer transform hover:scale-105'
            : 'bg-white border-gray-300'
          }
        `}
      >
        {/* Status icon */}
        <div className="flex items-start gap-2 mb-2">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
          ) : isLocked ? (
            <Lock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
          )}
          
          {/* Category badge */}
          {category && (
            <span className={`
              text-xs font-semibold px-2 py-1 rounded-full
              ${isGenerate || isCompleted 
                ? 'bg-white/20 text-white' 
                : 'bg-purple-100 text-purple-700'
              }
            `}>
              {category}
            </span>
          )}
        </div>

        {/* Label */}
        <h3 className={`
          font-bold text-sm mb-1
          ${isGenerate || isCompleted ? 'text-white' : 'text-gray-900'}
        `}>
          {label}
        </h3>

        {/* Description */}
        {description && (
          <p className={`
            text-xs mt-2
            ${isGenerate || isCompleted ? 'text-white/80' : 'text-gray-600'}
          `}>
            {description}
          </p>
        )}

        {/* Click hint */}
        {isClickable && !isLocked && !isCompleted && (
          <p className="text-xs text-white/60 mt-2 italic">
            Click to choose →
          </p>
        )}
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

