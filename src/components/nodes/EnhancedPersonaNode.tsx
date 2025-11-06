// Enhanced Persona Node Component
// Location: src/components/nodes/EnhancedPersonaNode.tsx

'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  ChevronDown, 
  ChevronUp,
  User,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  Heart,
  Target,
  Zap,
  Frown
} from 'lucide-react';
import { EnhancedPersona } from '@/types/enhanced-mindmap';

interface EnhancedPersonaNodeProps extends NodeProps {
  data: EnhancedPersona & {
    isExpanded?: boolean;
    onExpand?: (id: string) => void;
  };
}

export function EnhancedPersonaNode({ data, id }: EnhancedPersonaNodeProps) {
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
      className={`relative bg-gray-900 rounded-lg border-2 border-blue-500 bg-blue-500/10
                  shadow-lg transition-all duration-300 ${isExpanded ? 'w-[500px]' : 'w-[300px]'}`}
      style={{ minHeight: isExpanded ? '500px' : '250px' }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            {data.avatarUrl ? (
              <img 
                src={data.avatarUrl} 
                alt={data.title}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-white">{data.title}</h3>
              {data.demographics.occupation && (
                <p className="text-xs text-gray-400">{data.demographics.occupation}</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Demographics */}
        <div className="flex gap-2 flex-wrap text-xs">
          {data.demographics.ageRange && (
            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded flex items-center gap-1">
              <User className="w-3 h-3" />
              {data.demographics.ageRange}
            </span>
          )}
          {data.demographics.location && (
            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {data.demographics.location}
            </span>
          )}
          {data.demographics.income && (
            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {data.demographics.income}
            </span>
          )}
        </div>
      </div>

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-4">
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{data.description}</p>
          
          {data.quote && (
            <div className="bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-2">
              <p className="text-sm italic text-gray-300">"{data.quote}"</p>
            </div>
          )}
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
          <p className="text-sm text-gray-300">{data.description}</p>

          {/* Quote */}
          {data.quote && (
            <div className="bg-blue-500/10 border-l-2 border-blue-500 pl-3 py-2">
              <p className="text-sm italic text-gray-300">"{data.quote}"</p>
            </div>
          )}

          {/* Demographics */}
          <div>
            <h4 className="font-semibold text-white mb-2">Demographics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.demographics.occupation && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>{data.demographics.occupation}</span>
                </div>
              )}
              {data.demographics.education && (
                <div className="flex items-center gap-2 text-gray-300">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>{data.demographics.education}</span>
                </div>
              )}
              {data.demographics.location && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{data.demographics.location}</span>
                </div>
              )}
              {data.demographics.income && (
                <div className="flex items-center gap-2 text-gray-300">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>{data.demographics.income}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pain Points */}
          {data.psychographics.painPoints && data.psychographics.painPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Frown className="w-4 h-4 text-red-400" />
                Pain Points
              </h4>
              <ul className="space-y-1">
                {data.psychographics.painPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivations */}
          {data.psychographics.motivations && data.psychographics.motivations.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Motivations
              </h4>
              <ul className="space-y-1">
                {data.psychographics.motivations.map((motivation, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>{motivation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {data.psychographics.goals && data.psychographics.goals.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Goals
              </h4>
              <ul className="space-y-1">
                {data.psychographics.goals.map((goal, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Behavior */}
          {data.behavior && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Behavior
              </h4>
              <div className="space-y-2 text-sm">
                {data.behavior.techSavviness && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">Tech Level:</span> {data.behavior.techSavviness}
                  </p>
                )}
                {data.behavior.preferredChannels && data.behavior.preferredChannels.length > 0 && (
                  <div>
                    <span className="text-gray-400">Preferred Channels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.behavior.preferredChannels.map((channel, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

