// Enhanced Feature Node Component
// Location: src/components/nodes/EnhancedFeatureNode.tsx

'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Code,
  Database,
  Users,
  TrendingUp
} from 'lucide-react';
import { EnhancedFeature } from '@/types/enhanced-mindmap';

interface EnhancedFeatureNodeProps extends NodeProps {
  data: EnhancedFeature & {
    isExpanded?: boolean;
    onExpand?: (id: string) => void;
    onEdit?: (id: string) => void;
    onViewPRD?: (featureId: string) => void;
    onGeneratePRD?: (featureId: string) => void;
    hasPRD?: boolean;
    prd?: any;
    status?: string;
  };
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high': return 'border-red-500 bg-red-500/10';
    case 'medium': return 'border-yellow-500 bg-yellow-500/10';
    case 'low': return 'border-green-500 bg-green-500/10';
    default: return 'border-purple-500 bg-purple-500/10';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'in-progress': return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'blocked': return <AlertCircle className="w-4 h-4 text-red-400" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getComplexityLabel = (complexity?: string) => {
  switch (complexity) {
    case 'simple': return { label: 'Simple', color: 'bg-green-500' };
    case 'moderate': return { label: 'Moderate', color: 'bg-yellow-500' };
    case 'complex': return { label: 'Complex', color: 'bg-red-500' };
    default: return { label: 'Unknown', color: 'bg-gray-500' };
  }
};

export function EnhancedFeatureNode({ data, id }: EnhancedFeatureNodeProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = data.isExpanded ?? localExpanded;
  
  const toggleExpand = () => {
    if (data.onExpand) {
      data.onExpand(id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  const complexityInfo = getComplexityLabel(data.complexity);
  const roi = data.scoring?.roi || 0;

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg border-2 ${getPriorityColor(data.priority)} 
                  shadow-lg transition-all duration-300 ${isExpanded ? 'w-[700px]' : 'w-[350px]'} cursor-pointer`}
      style={{ minHeight: isExpanded ? '600px' : '250px' }}
      onDoubleClick={toggleExpand}
      title="Double-click to expand/collapse"
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-purple-500" />

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(data.status)}
            <h3 className="font-bold text-lg text-white">{data.title}</h3>
          </div>
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Tags & Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`px-2 py-1 rounded text-xs ${complexityInfo.color} text-white`}>
            {complexityInfo.label}
          </span>
          {data.priority && (
            <span className="px-2 py-1 rounded text-xs bg-gray-700 text-white capitalize">
              {data.priority} Priority
            </span>
          )}
          {data.estimatedHours && (
            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {data.estimatedHours}h
            </span>
          )}
          {roi > 0 && (
            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ROI: {roi.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Collapsed Content */}
      {!isExpanded && (
        <div className="p-4">
          <p className="text-sm text-gray-300 mb-3 line-clamp-3">{data.description}</p>
          
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {tag}
                </span>
              ))}
              {data.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                  +{data.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* PRD Actions */}
          <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
            {data.hasPRD ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onViewPRD?.(id);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                📄 View PRD
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onGeneratePRD?.(id);
                }}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
              >
                ✨ Generate PRD
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar">
          {/* Overview & Purpose */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              Overview & Purpose
            </h4>
            <p className="text-sm text-gray-300">{data.overview}</p>
          </div>

          {/* User Stories */}
          {data.userStories && data.userStories.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                User Stories
              </h4>
              <div className="space-y-2">
                {data.userStories.map((story) => (
                  <div key={story.id} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <p className="text-sm text-gray-300">
                      <span className="text-blue-400 font-medium">As a {story.persona}</span>, 
                      I want to <span className="text-purple-400 font-medium">{story.need}</span> so 
                      that <span className="text-green-400 font-medium">{story.goal}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          {data.acceptanceCriteria && data.acceptanceCriteria.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Acceptance Criteria</h4>
              <ul className="space-y-1">
                {data.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Implementation */}
          {data.technicalImplementation && (
            <div>
              <h4 className="font-semibold text-white mb-2">Technical Implementation</h4>
              <div className="grid grid-cols-2 gap-3">
                {data.technicalImplementation.frontend && (
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-xs font-medium text-purple-400 mb-1">Frontend</p>
                    <ul className="text-xs text-gray-300 space-y-0.5">
                      {data.technicalImplementation.frontend.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.technicalImplementation.backend && (
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-xs font-medium text-blue-400 mb-1">Backend</p>
                    <ul className="text-xs text-gray-300 space-y-0.5">
                      {data.technicalImplementation.backend.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {data.technicalImplementation.steps && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-400 mb-1">Implementation Steps:</p>
                  <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                    {data.technicalImplementation.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Database Schema */}
          {data.databaseSchema && data.databaseSchema.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-yellow-400" />
                Database Schema
              </h4>
              <div className="space-y-2">
                {data.databaseSchema.map((schema, idx) => (
                  <div key={idx} className="bg-gray-800/50 p-2 rounded border border-gray-700">
                    <p className="text-sm font-mono text-yellow-400 mb-1">{schema.tableName}</p>
                    <div className="text-xs text-gray-300 space-y-0.5">
                      {schema.columns.map((col, colIdx) => (
                        <div key={colIdx} className="flex gap-2">
                          <span className="text-purple-400">{col.name}</span>
                          <span className="text-gray-500">{col.type}</span>
                          {col.constraints && <span className="text-blue-400">{col.constraints}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Endpoints */}
          {data.apiEndpoints && data.apiEndpoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">API Endpoints</h4>
              <div className="space-y-1">
                {data.apiEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-gray-800/50 p-2 rounded">
                    <span className={`px-2 py-0.5 rounded font-mono ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-gray-300 font-mono">{endpoint.path}</span>
                    {endpoint.auth && <span className="text-xs text-purple-400">(Auth)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {data.dependencies && data.dependencies.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Dependencies</h4>
              <p className="text-xs text-gray-400">
                This feature depends on: {data.dependencies.join(', ')}
              </p>
            </div>
          )}

          {/* PRD Actions - Expanded View */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
            {data.hasPRD ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onViewPRD?.(id);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                📄 View PRD
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onGeneratePRD?.(id);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors"
              >
                ✨ Generate PRD
              </button>
            )}
            {data.hasPRD && (data as any).status === 'detailed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Approve action would be handled by the modal
                  data.onViewPRD?.(id);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
              >
                ✅ Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

