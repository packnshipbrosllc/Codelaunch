'use client';

import { useState } from 'react';
import { 
  FileText, 
  Users, 
  Code, 
  Database, 
  TrendingUp, 
  Shield,
  Zap,
  Target,
  DollarSign,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

interface EnhancedPRDViewerProps {
  prd: any; // The parsed PRD JSON from database
  onClose?: () => void;
}

export default function EnhancedPRDViewer({ prd, onClose }: EnhancedPRDViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive']));
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleFeature = (index: number) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFeatures(newExpanded);
  };

  // Handle both string and object formats
  let content: any = null;
  if (!prd || (!prd.content && !prd.rawText)) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-purple-500/20">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-4xl font-bold mb-3">PRD Viewer</h1>
          </div>
          <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-medium">No PRD data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse content - handle both string and object formats
  try {
    if (typeof prd.content === 'string') {
      content = JSON.parse(prd.content);
    } else if (prd.content && typeof prd.content === 'object') {
      content = prd.content;
    } else if (prd.rawText) {
      // Fallback: try to parse rawText as JSON
      try {
        content = JSON.parse(prd.rawText);
      } catch {
        // If rawText is not JSON, return a simple text viewer
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-purple-500/20">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 relative">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
                <h1 className="text-4xl font-bold mb-3">{prd.projectName || 'PRD'}</h1>
                <p className="text-purple-100 text-lg">Product Requirements Document</p>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                  {prd.rawText}
                </pre>
              </div>
              {onClose && (
                <div className="bg-gray-800 px-8 py-6 border-t border-gray-700 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  } catch (error) {
    console.error('Error parsing PRD content:', error);
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-purple-500/20">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-4xl font-bold mb-3">PRD Viewer</h1>
          </div>
          <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-medium">Error parsing PRD data</p>
              <p className="text-gray-400 text-sm mt-2">The PRD format is not recognized.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 font-medium">No PRD content available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-4xl font-bold mb-3">{prd.projectName || content.projectName || 'PRD'}</h1>
          <p className="text-purple-100 text-lg">Product Requirements Document</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Executive Summary */}
          <Section
            title="Executive Summary"
            icon={<FileText className="h-5 w-5" />}
            isExpanded={expandedSections.has('executive')}
            onToggle={() => toggleSection('executive')}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Overview</h4>
                <p className="text-gray-300 leading-relaxed">{content.executiveSummary?.overview || content.overview || 'No overview provided.'}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-400 mb-2">Problem Statement</h4>
                  <p className="text-gray-300 text-sm">{content.executiveSummary?.problemStatement || content.problemStatement || 'No problem statement provided.'}</p>
                </div>
                
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400 mb-2">Value Proposition</h4>
                  <p className="text-gray-300 text-sm">{content.executiveSummary?.valueProposition || content.valueProposition || 'No value proposition provided.'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Target Market</h4>
                <p className="text-gray-300">{content.executiveSummary?.targetMarket || content.targetMarket || 'No target market specified.'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Success Metrics</h4>
                <ul className="space-y-2">
                  {(content.executiveSummary?.successMetrics || content.successMetrics || []).map((metric: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Features */}
          {content.features && content.features.length > 0 && (
            <Section
              title={`Features (${content.features.length})`}
              icon={<Zap className="h-5 w-5" />}
              isExpanded={expandedSections.has('features')}
              onToggle={() => toggleSection('features')}
            >
              <div className="space-y-4">
                {content.features.map((feature: any, idx: number) => (
                  <FeatureCard
                    key={idx}
                    feature={feature}
                    index={idx}
                    isExpanded={expandedFeatures.has(idx)}
                    onToggle={() => toggleFeature(idx)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* User Personas */}
          {content.userPersonas && content.userPersonas.length > 0 && (
            <Section
              title="User Personas"
              icon={<Users className="h-5 w-5" />}
              isExpanded={expandedSections.has('personas')}
              onToggle={() => toggleSection('personas')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {content.userPersonas.map((persona: any, idx: number) => (
                  <PersonaCard key={idx} persona={persona} />
                ))}
              </div>
            </Section>
          )}

          {/* Technical Architecture */}
          {content.technicalArchitecture && (
            <Section
              title="Technical Architecture"
              icon={<Code className="h-5 w-5" />}
              isExpanded={expandedSections.has('architecture')}
              onToggle={() => toggleSection('architecture')}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">System Overview</h4>
                  <p className="text-gray-300">{content.technicalArchitecture?.systemOverview || 'No system overview provided.'}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold text-cyan-400 mb-3">Tech Stack</h4>
                    {Object.entries(content.technicalArchitecture?.techStack || {}).map(([key, values]: [string, any]) => (
                      <div key={key} className="mb-3">
                        <p className="text-sm text-gray-400 capitalize mb-1">{key}</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(values) ? values : [values]).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Data Flow</h4>
                      <p className="text-gray-300 text-sm">{content.technicalArchitecture?.dataFlow || 'No data flow description provided.'}</p>
                    </div>
                    
                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Security</h4>
                      <p className="text-gray-300 text-sm">{content.technicalArchitecture?.securityArchitecture || 'No security architecture provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Monetization */}
          {content.monetization && (
            <Section
              title="Monetization Strategy"
              icon={<DollarSign className="h-5 w-5" />}
              isExpanded={expandedSections.has('monetization')}
              onToggle={() => toggleSection('monetization')}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Revenue Model</h4>
                  <p className="text-gray-300">{content.monetization?.revenueModel || 'No revenue model specified.'}</p>
                </div>

                {content.monetization?.pricingStrategy?.tiers && content.monetization.pricingStrategy.tiers.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4">
                    {content.monetization.pricingStrategy.tiers.map((tier: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
                        <h4 className="font-bold text-xl text-white mb-2">{tier.name}</h4>
                        <p className="text-3xl font-bold text-purple-400 mb-4">{tier.price}</p>
                        <ul className="space-y-2 mb-4">
                          {(tier.features || []).map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        {tier.targetUser && <p className="text-xs text-gray-400">{tier.targetUser}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Competitor Analysis */}
          {content.competitorAnalysis && content.competitorAnalysis.length > 0 && (
            <Section
              title="Competitor Analysis"
              icon={<Target className="h-5 w-5" />}
              isExpanded={expandedSections.has('competitors')}
              onToggle={() => toggleSection('competitors')}
            >
              <div className="space-y-4">
                {content.competitorAnalysis.map((competitor: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-bold text-white text-lg mb-3">{competitor.competitor || competitor.name}</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-green-400 font-medium mb-2">Strengths</p>
                        <ul className="space-y-1">
                          {(competitor.strengths || []).map((s: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-red-400 font-medium mb-2">Weaknesses</p>
                        <ul className="space-y-1">
                          {(competitor.weaknesses || []).map((w: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300">• {w}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-purple-400 font-medium mb-2">Our Edge</p>
                        <ul className="space-y-1">
                          {(competitor.differentiators || competitor.ourAdvantage ? [competitor.ourAdvantage] : []).map((d: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300">• {d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Roadmap */}
          {content.roadmap && (
            <Section
              title="Product Roadmap"
              icon={<GitBranch className="h-5 w-5" />}
              isExpanded={expandedSections.has('roadmap')}
              onToggle={() => toggleSection('roadmap')}
            >
              <div className="space-y-4">
                {['mvp', 'phase2', 'phase3'].map((phase) => {
                  const phaseData = content.roadmap?.[phase];
                  if (!phaseData) return null;
                  return (
                    <div key={phase} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white uppercase">{phase.replace('phase', 'Phase ')}</h4>
                        {phaseData.timeline && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                            {phaseData.timeline}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {phaseData.features && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Features:</p>
                            <div className="flex flex-wrap gap-2">
                              {phaseData.features.map((feature: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {phaseData.goals && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Goals:</p>
                            <ul className="space-y-1">
                              {phaseData.goals.map((goal: string, i: number) => (
                                <li key={i} className="text-sm text-gray-300">• {goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Risks */}
          {content.risksAndMitigation && content.risksAndMitigation.length > 0 && (
            <Section
              title="Risks & Mitigation"
              icon={<AlertTriangle className="h-5 w-5" />}
              isExpanded={expandedSections.has('risks')}
              onToggle={() => toggleSection('risks')}
            >
              <div className="space-y-3">
                {content.risksAndMitigation.map((risk: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{risk.risk}</h4>
                      <div className="flex gap-2">
                        {risk.impact && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                            risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            Impact: {risk.impact}
                          </span>
                        )}
                        {risk.probability && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            risk.probability === 'high' ? 'bg-red-500/20 text-red-400' :
                            risk.probability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            Probability: {risk.probability}
                          </span>
                        )}
                      </div>
                    </div>
                    {risk.mitigation && <p className="text-gray-300 text-sm">{risk.mitigation}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        {onClose && (
          <div className="bg-gray-800 px-8 py-6 border-t border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-400">Generated with CodeLaunch</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Section component with collapsible functionality
function Section({ title, icon, children, isExpanded, onToggle }: any) {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-purple-400">{icon}</div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

// Feature card component with detailed breakdown
function FeatureCard({ feature, index, isExpanded, onToggle }: any) {
  const priorityColors = {
    P0: 'bg-red-500/20 text-red-400 border-red-500/30',
    P1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    P2: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {feature.priority && (
            <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[feature.priority as keyof typeof priorityColors] || priorityColors.P2}`}>
              {feature.priority}
            </span>
          )}
          <h4 className="font-semibold text-white">{feature.featureName || feature.name || feature.title || `Feature ${index + 1}`}</h4>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-700">
          {(feature.overview || feature.description) && (
            <p className="text-gray-300">{feature.overview || feature.description}</p>
          )}

          {/* User Stories */}
          {feature.userStories && feature.userStories.length > 0 && (
            <div>
              <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                User Stories
              </h5>
              <div className="space-y-3">
                {feature.userStories.map((story: any, idx: number) => (
                  <div key={idx} className="bg-purple-500/10 rounded p-3 border border-purple-500/20">
                    {story.persona && <p className="text-purple-400 text-sm font-medium mb-1">{story.persona}</p>}
                    {(story.story || story.goal) && <p className="text-gray-300 text-sm mb-2">{story.story || story.goal}</p>}
                    {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                      <div className="space-y-1">
                        {story.acceptanceCriteria.map((criteria: string, i: number) => (
                          <p key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{criteria}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Implementation */}
          {feature.technicalImplementation && (
            <div>
              <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                Technical Implementation
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {feature.technicalImplementation.frontend && (
                  <div className="bg-cyan-500/10 rounded p-3 border border-cyan-500/20">
                    <p className="text-cyan-400 text-sm font-medium mb-2">Frontend</p>
                    {typeof feature.technicalImplementation.frontend === 'string' ? (
                      <p className="text-gray-300 text-sm">{feature.technicalImplementation.frontend}</p>
                    ) : (
                      <>
                        {feature.technicalImplementation.frontend.approach && (
                          <p className="text-gray-300 text-sm mb-2">{feature.technicalImplementation.frontend.approach}</p>
                        )}
                        {feature.technicalImplementation.frontend.components && (
                          <div className="space-y-1">
                            {feature.technicalImplementation.frontend.components.map((comp: string, i: number) => (
                              <p key={i} className="text-xs text-gray-400">• {comp}</p>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {feature.technicalImplementation.backend && (
                  <div className="bg-green-500/10 rounded p-3 border border-green-500/20">
                    <p className="text-green-400 text-sm font-medium mb-2">Backend</p>
                    {typeof feature.technicalImplementation.backend === 'string' ? (
                      <p className="text-gray-300 text-sm">{feature.technicalImplementation.backend}</p>
                    ) : (
                      <>
                        {feature.technicalImplementation.backend.businessLogic && (
                          <p className="text-gray-300 text-sm mb-2">{feature.technicalImplementation.backend.businessLogic}</p>
                        )}
                        {feature.technicalImplementation.backend.apiEndpoints && feature.technicalImplementation.backend.apiEndpoints.length > 0 && (
                          <div className="space-y-1">
                            {feature.technicalImplementation.backend.apiEndpoints.slice(0, 2).map((endpoint: any, i: number) => (
                              <p key={i} className="text-xs text-gray-400">
                                <span className="font-mono text-green-400">{endpoint.method}</span> {endpoint.path}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Database Schema */}
          {feature.technicalImplementation?.database?.tables && (
            <div>
              <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                Database Schema
              </h5>
              <div className="space-y-2">
                {feature.technicalImplementation.database.tables.map((table: any, idx: number) => (
                  <div key={idx} className="bg-blue-500/10 rounded p-3 border border-blue-500/20">
                    <p className="text-blue-400 font-mono text-sm mb-2">{table.tableName}</p>
                    <div className="space-y-1">
                      {(table.columns || []).slice(0, 4).map((col: any, i: number) => (
                        <p key={i} className="text-xs text-gray-400">
                          <span className="font-mono text-blue-300">{col.name}</span>: {col.type}
                          {col.constraints && <span className="text-gray-500"> ({col.constraints})</span>}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effort Estimation */}
          {feature.estimations && (
            <div className="flex items-center justify-between bg-gray-900/50 rounded p-3 border border-gray-700">
              {feature.estimations.complexity && (
                <div>
                  <p className="text-gray-400 text-sm">Complexity</p>
                  <p className="text-white font-medium capitalize">{feature.estimations.complexity}</p>
                </div>
              )}
              {feature.estimations.engineeringHours && (
                <div>
                  <p className="text-gray-400 text-sm">Total Hours</p>
                  <p className="text-white font-medium">{feature.estimations.engineeringHours}</p>
                </div>
              )}
              {feature.estimations.breakdown?.frontend && (
                <div>
                  <p className="text-gray-400 text-sm">Frontend</p>
                  <p className="text-white font-medium">{feature.estimations.breakdown.frontend}</p>
                </div>
              )}
              {feature.estimations.breakdown?.backend && (
                <div>
                  <p className="text-gray-400 text-sm">Backend</p>
                  <p className="text-white font-medium">{feature.estimations.breakdown.backend}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Persona card component
function PersonaCard({ persona }: any) {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
      <h4 className="font-bold text-white text-lg mb-3">{persona.name || 'User Persona'}</h4>
      
      <div className="space-y-3">
        {persona.demographics && (
          <div>
            <p className="text-purple-400 text-sm font-medium mb-1">Demographics</p>
            <p className="text-gray-300 text-sm">
              {persona.demographics.age && `${persona.demographics.age} • `}
              {persona.demographics.occupation || 'Not specified'}
            </p>
          </div>
        )}

        {persona.psychographics?.goals && persona.psychographics.goals.length > 0 && (
          <div>
            <p className="text-purple-400 text-sm font-medium mb-1">Goals</p>
            <ul className="space-y-1">
              {persona.psychographics.goals.slice(0, 3).map((goal: string, i: number) => (
                <li key={i} className="text-gray-300 text-sm">• {goal}</li>
              ))}
            </ul>
          </div>
        )}

        {persona.psychographics?.painPoints && persona.psychographics.painPoints.length > 0 && (
          <div>
            <p className="text-purple-400 text-sm font-medium mb-1">Pain Points</p>
            <ul className="space-y-1">
              {persona.psychographics.painPoints.slice(0, 3).map((pain: string, i: number) => (
                <li key={i} className="text-gray-300 text-sm">• {pain}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

