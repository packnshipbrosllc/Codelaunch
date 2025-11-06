// Enhanced Competitor Node Component
// Location: src/components/nodes/EnhancedCompetitorNode.tsx

'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { EnhancedCompetitor } from '@/types/enhanced-mindmap';

interface EnhancedCompetitorNodeProps extends NodeProps {
  data: EnhancedCompetitor & {
    isExpanded?: boolean;
    onExpand?: (id: string) => void;
  };
}

export function EnhancedCompetitorNode({ data, id }: EnhancedCompetitorNodeProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = data.isExpanded ?? localExpanded;
  
  const toggleExpand = () => {
    if (data.onExpand) {
      data.onExpand(id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg border-2 border-orange-500 bg-orange-500/10
                  shadow-lg transition-all duration-300 ${isExpanded ? 'w-[500px]' : 'w-[300px]'}`}
      style={{ minHeight: isExpanded ? '400px' : '200px' }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-lg text-white">{data.title}</h3>
            </div>
            {data.url && (
              <a 
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                Visit site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 flex-wrap">
          {data.pricing && (
            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {data.pricing}
            </span>
          )}
          {data.marketShare && (
            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
              {data.marketShare} market share
            </span>
          )}
        </div>
      </div>

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-4">
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{data.description}</p>
          
          {/* Our Advantage Preview */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
            <p className="text-xs font-medium text-purple-400 mb-1 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Our Advantage
            </p>
            <p className="text-xs text-gray-300 line-clamp-2">{data.ourAdvantage}</p>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-300">{data.description}</p>

          {/* Strengths */}
          {data.strengths && data.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Their Strengths
              </h4>
              <ul className="space-y-1">
                {data.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Their Weaknesses
              </h4>
              <ul className="space-y-1">
                {data.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-1">-</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Features */}
          {data.keyFeatures && data.keyFeatures.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-1">
                {data.keyFeatures.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Our Advantage */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Our Competitive Advantage
            </h4>
            <p className="text-sm text-purple-300">{data.ourAdvantage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

