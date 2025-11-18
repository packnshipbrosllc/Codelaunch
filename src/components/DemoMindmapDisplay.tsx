'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoMindmapDisplayProps {
  mindmapData: {
    projectName: string;
    projectDescription: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      priority: string;
      userStories?: Array<{
        persona: string;
        need: string;
        goal: string;
      }>;
      acceptanceCriteria?: string[];
      technicalImplementation?: {
        frontend?: string[];
        backend?: string[];
        database?: string[];
        steps?: string[];
      };
    }>;
    targetAudience?: string;
    userPersona?: {
      name: string;
      description: string;
      painPoint: string;
      goal: string;
    };
  };
}

export function DemoMindmapDisplay({ mindmapData }: DemoMindmapDisplayProps) {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  const toggleFeature = (featureId: string) => {
    setExpandedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-purple-500/50 bg-purple-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Core Concept */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-2xl font-bold text-white mb-2">{mindmapData.projectName}</h3>
        <p className="text-gray-300">{mindmapData.projectDescription}</p>
      </div>

      {/* Target Users */}
      {mindmapData.targetAudience && (
        <div className="bg-gray-900/60 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Target Audience</h4>
          <p className="text-gray-300">{mindmapData.targetAudience}</p>
        </div>
      )}

      {/* User Persona */}
      {mindmapData.userPersona && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Primary User: {mindmapData.userPersona.name}</h4>
          <p className="text-gray-300 mb-2">{mindmapData.userPersona.description}</p>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-blue-300 font-medium">Pain Point: </span>
              <span className="text-gray-300">{mindmapData.userPersona.painPoint}</span>
            </div>
            <div>
              <span className="text-blue-300 font-medium">Goal: </span>
              <span className="text-gray-300">{mindmapData.userPersona.goal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">Key Features ({mindmapData.features?.length || 0})</h4>
        
        {mindmapData.features?.map((feature) => {
          const isExpanded = expandedFeatures.has(feature.id);
          
          return (
            <div
              key={feature.id}
              className={`border rounded-xl overflow-hidden transition-all ${getPriorityColor(feature.priority)}`}
            >
              <button
                onClick={() => toggleFeature(feature.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h5 className="text-lg font-semibold text-white">{feature.title}</h5>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      feature.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      feature.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {feature.priority}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
                <div className="ml-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 border-t border-white/10 mt-2">
                      {/* User Stories */}
                      {feature.userStories && feature.userStories.length > 0 && (
                        <div>
                          <h6 className="text-sm font-semibold text-purple-300 mb-2">User Stories</h6>
                          <div className="space-y-2">
                            {feature.userStories.map((story, idx) => (
                              <div key={idx} className="bg-gray-800/50 rounded-lg p-3 text-sm">
                                <span className="text-white font-medium">As a {story.persona}, </span>
                                <span className="text-gray-300">I need {story.need} </span>
                                <span className="text-gray-400">so that {story.goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Acceptance Criteria */}
                      {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
                        <div>
                          <h6 className="text-sm font-semibold text-blue-300 mb-2">Acceptance Criteria</h6>
                          <ul className="space-y-1">
                            {feature.acceptanceCriteria.map((criterion, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{criterion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Technical Implementation */}
                      {feature.technicalImplementation && (
                        <div>
                          <h6 className="text-sm font-semibold text-green-300 mb-2">Technical Details</h6>
                          <div className="space-y-2 text-sm">
                            {feature.technicalImplementation.frontend && feature.technicalImplementation.frontend.length > 0 && (
                              <div>
                                <span className="text-green-400 font-medium">Frontend: </span>
                                <span className="text-gray-300">{feature.technicalImplementation.frontend.join(', ')}</span>
                              </div>
                            )}
                            {feature.technicalImplementation.backend && feature.technicalImplementation.backend.length > 0 && (
                              <div>
                                <span className="text-green-400 font-medium">Backend: </span>
                                <span className="text-gray-300">{feature.technicalImplementation.backend.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

