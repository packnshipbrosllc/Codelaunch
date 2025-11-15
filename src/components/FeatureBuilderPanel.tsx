'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { EnhancedFeature } from '@/types/enhanced-mindmap';

interface FeatureBuilderPanelProps {
  feature: EnhancedFeature;
  projectContext: {
    projectName: string;
    projectDescription: string;
    techStack: any;
    allFeatures: EnhancedFeature[];
  };
  onClose: () => void;
  onSavePRD: (featureId: string, prd: any) => void;
  onGenerateCode: (featureId: string) => void;
}

interface FormData {
  userStories: string;
  acceptanceCriteria: string;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  dataModels: Record<string, any>;
  uiComponents: string[];
  dependencies: string[];
  edgeCases: string;
  errorHandling: string;
}

const steps = [
  { 
    id: 1, 
    title: 'User Stories & Requirements', 
    icon: '📝',
    description: 'Define what users need and why'
  },
  { 
    id: 2, 
    title: 'Technical Specifications', 
    icon: '⚙️',
    description: 'API endpoints, data models, components'
  },
  { 
    id: 3, 
    title: 'Dependencies & Build Order', 
    icon: '🔗',
    description: 'What needs to be built first'
  },
  { 
    id: 4, 
    title: 'Edge Cases & Error Handling', 
    icon: '🛡️',
    description: 'Handle all scenarios properly'
  },
  { 
    id: 5, 
    title: 'Generate Comprehensive PRD', 
    icon: '📄',
    description: 'Create complete documentation'
  },
  { 
    id: 6, 
    title: 'Generate Production Code', 
    icon: '💻',
    description: 'Bug-free, production-ready code'
  }
];

export default function FeatureBuilderPanel({ 
  feature, 
  projectContext, 
  onClose,
  onSavePRD,
  onGenerateCode 
}: FeatureBuilderPanelProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    userStories: feature.userStories?.map(us => `As a ${us.persona}, I want to ${us.need} so that ${us.goal}`).join('\n') || '',
    acceptanceCriteria: feature.acceptanceCriteria?.join('\n') || '',
    apiEndpoints: feature.apiEndpoints?.map(ep => ({
      method: ep.method,
      path: ep.path,
      description: ep.description
    })) || [],
    dataModels: {},
    uiComponents: [],
    dependencies: feature.dependencies || [],
    edgeCases: '',
    errorHandling: '',
  });

  const calculateProgress = (): number => {
    let progress = 0;
    if (formData.userStories.trim()) progress += 16.67;
    if (formData.acceptanceCriteria.trim()) progress += 16.67;
    if (formData.apiEndpoints.length > 0) progress += 16.67;
    if (formData.dependencies.length >= 0) progress += 16.67;
    if (formData.edgeCases.trim()) progress += 16.67;
    if (formData.errorHandling.trim()) progress += 16.67;
    return Math.min(100, progress);
  };

  const requirementsProgress = calculateProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className="w-full max-w-5xl h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Sidebar - Steps Progress */}
        <div className="w-80 bg-black/40 border-r border-purple-500/20 p-6 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">Feature Builder</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400">{feature.title}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-purple-400 font-semibold">{Math.round(requirementsProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${requirementsProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {steps.map((step) => {
              const stepProgress = (step.id / steps.length) * 100;
              const isCompleted = requirementsProgress >= stepProgress;
              const isActive = currentStep === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : isCompleted
                      ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{step.title}</div>
                      <div className="text-xs opacity-70 mt-1">{step.description}</div>
                    </div>
                    {isCompleted && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area - Current Step */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep === 1 && <UserStoriesStep feature={feature} formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <TechnicalSpecsStep feature={feature} projectContext={projectContext} formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <DependenciesStep feature={feature} projectContext={projectContext} formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && <EdgeCasesStep feature={feature} formData={formData} setFormData={setFormData} />}
          {currentStep === 5 && <GeneratePRDStep feature={feature} formData={formData} onSavePRD={onSavePRD} isGenerating={isGenerating} setIsGenerating={setIsGenerating} />}
          {currentStep === 6 && <GenerateCodeStep feature={feature} formData={formData} onGenerateCode={onGenerateCode} isGenerating={isGenerating} setIsGenerating={setIsGenerating} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t border-gray-700">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all"
              >
                ← Previous Step
              </button>
            )}
            
            {currentStep < steps.length && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function UserStoriesStep({ feature, formData, setFormData }: { feature: EnhancedFeature; formData: FormData; setFormData: (data: FormData) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">📝 User Stories & Requirements</h3>
      <p className="text-gray-400 mb-6">
        Define clear user stories and acceptance criteria. This helps ensure we build exactly what users need.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">User Stories</label>
          <p className="text-sm text-gray-400 mb-3">Write 3-5 user stories in format: "As a [user type], I want to [action] so that [benefit]"</p>
          <textarea
            value={formData.userStories}
            onChange={(e) => setFormData({...formData, userStories: e.target.value})}
            placeholder="Example:
As a fitness enthusiast, I want to track my daily macros so that I can meet my nutrition goals.
As a user, I want to see my progress over time so that I stay motivated."
            className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Acceptance Criteria</label>
          <p className="text-sm text-gray-400 mb-3">Define what "done" looks like for this feature</p>
          <textarea
            value={formData.acceptanceCriteria}
            onChange={(e) => setFormData({...formData, acceptanceCriteria: e.target.value})}
            placeholder="Example:
- Users can input food items and see macro breakdown
- Daily totals are calculated automatically
- Users can view history for past 30 days
- Data persists across sessions"
            className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>Enhance with AI Suggestions</span>
        </button>
      </div>
    </div>
  );
}

function TechnicalSpecsStep({ feature, projectContext, formData, setFormData }: { feature: EnhancedFeature; projectContext: any; formData: FormData; setFormData: (data: FormData) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">⚙️ Technical Specifications</h3>
      <p className="text-gray-400 mb-6">
        Define the technical implementation details: APIs, data models, and UI components needed.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">API Endpoints</label>
          <p className="text-sm text-gray-400 mb-3">Define REST API endpoints for this feature</p>
          <div className="space-y-3">
            {formData.apiEndpoints.map((endpoint, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={endpoint.method}
                  onChange={(e) => {
                    const newEndpoints = [...formData.apiEndpoints];
                    newEndpoints[idx].method = e.target.value;
                    setFormData({...formData, apiEndpoints: newEndpoints});
                  }}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
                <input
                  type="text"
                  value={endpoint.path}
                  onChange={(e) => {
                    const newEndpoints = [...formData.apiEndpoints];
                    newEndpoints[idx].path = e.target.value;
                    setFormData({...formData, apiEndpoints: newEndpoints});
                  }}
                  placeholder="/api/endpoint"
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  value={endpoint.description}
                  onChange={(e) => {
                    const newEndpoints = [...formData.apiEndpoints];
                    newEndpoints[idx].description = e.target.value;
                    setFormData({...formData, apiEndpoints: newEndpoints});
                  }}
                  placeholder="Description"
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                />
                <button
                  onClick={() => {
                    setFormData({...formData, apiEndpoints: formData.apiEndpoints.filter((_, i) => i !== idx)});
                  }}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  apiEndpoints: [...formData.apiEndpoints, { method: 'GET', path: '', description: '' }]
                });
              }}
              className="w-full px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            >
              + Add Endpoint
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">UI Components</label>
          <textarea
            value={formData.uiComponents.join('\n')}
            onChange={(e) => setFormData({...formData, uiComponents: e.target.value.split('\n').filter(c => c.trim())})}
            placeholder="List UI components needed:
- UserDashboard
- MacroInputForm
- ProgressChart
- HistoryView"
            className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

function DependenciesStep({ feature, projectContext, formData, setFormData }: { feature: EnhancedFeature; projectContext: any; formData: FormData; setFormData: (data: FormData) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">🔗 Dependencies & Build Order</h3>
      <p className="text-gray-400 mb-6">
        Identify which features must be built before this one, and what this feature enables.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">Depends On</label>
          <p className="text-sm text-gray-400 mb-3">Features that must be completed first</p>
          <div className="space-y-2">
            {projectContext.allFeatures
              .filter(f => f.id !== feature.id)
              .map(f => (
                <label key={f.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={formData.dependencies.includes(f.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, dependencies: [...formData.dependencies, f.id]});
                      } else {
                        setFormData({...formData, dependencies: formData.dependencies.filter(id => id !== f.id)});
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-white">{f.title}</span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EdgeCasesStep({ feature, formData, setFormData }: { feature: EnhancedFeature; formData: FormData; setFormData: (data: FormData) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">🛡️ Edge Cases & Error Handling</h3>
      <p className="text-gray-400 mb-6">
        Think through all the ways things could go wrong and how to handle them gracefully.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">Edge Cases</label>
          <textarea
            value={formData.edgeCases}
            onChange={(e) => setFormData({...formData, edgeCases: e.target.value})}
            placeholder="Example:
- What if user enters invalid data?
- What if API is down?
- What if user has no internet?
- What if database is full?
- What if user tries to access deleted data?"
            className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Error Handling Strategy</label>
          <textarea
            value={formData.errorHandling}
            onChange={(e) => setFormData({...formData, errorHandling: e.target.value})}
            placeholder="Example:
- Show user-friendly error messages
- Log errors for debugging
- Retry failed API calls 3 times
- Fallback to cached data when offline
- Validate all inputs before processing"
            className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

function GeneratePRDStep({ feature, formData, onSavePRD, isGenerating, setIsGenerating }: { feature: EnhancedFeature; formData: FormData; onSavePRD: (featureId: string, prd: any) => void; isGenerating: boolean; setIsGenerating: (val: boolean) => void }) {
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/features/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: feature.id,
          featureTitle: feature.title,
          featureDescription: feature.description,
          userStories: formData.userStories,
          acceptanceCriteria: formData.acceptanceCriteria.split('\n').filter(c => c.trim()),
          apiEndpoints: formData.apiEndpoints,
          dependencies: formData.dependencies,
          edgeCases: formData.edgeCases.split('\n').filter(c => c.trim()),
          errorHandling: formData.errorHandling,
        })
      });
      const result = await response.json();
      if (result.success) {
        onSavePRD(feature.id, result.prd);
      }
    } catch (error) {
      console.error('Failed to generate PRD:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">📄 Generate Comprehensive PRD</h3>
      <p className="text-gray-400 mb-6">
        Generate a complete Product Requirements Document based on all the information you've provided.
      </p>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
        <h4 className="text-white font-semibold mb-3">PRD will include:</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>✓ Executive summary</li>
          <li>✓ User stories and acceptance criteria</li>
          <li>✓ Technical specifications</li>
          <li>✓ API endpoint documentation</li>
          <li>✓ Database schema</li>
          <li>✓ Dependencies and build order</li>
          <li>✓ Edge cases and error handling</li>
          <li>✓ Testing strategy</li>
        </ul>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating PRD...</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Generate Comprehensive PRD</span>
          </>
        )}
      </button>
    </div>
  );
}

function GenerateCodeStep({ feature, formData, onGenerateCode, isGenerating, setIsGenerating }: { feature: EnhancedFeature; formData: FormData; onGenerateCode: (featureId: string) => void; isGenerating: boolean; setIsGenerating: (val: boolean) => void }) {
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Call code generation API
      await onGenerateCode(feature.id);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-bold text-white mb-4">💻 Generate Production Code</h3>
      <p className="text-gray-400 mb-6">
        Generate bug-free, production-ready code based on the PRD and all specifications.
      </p>

      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
        <h4 className="text-white font-semibold mb-3">Code will include:</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>✓ Frontend components (React/Next.js)</li>
          <li>✓ Backend API routes</li>
          <li>✓ Database migrations</li>
          <li>✓ Type definitions</li>
          <li>✓ Error handling</li>
          <li>✓ Input validation</li>
          <li>✓ Tests</li>
          <li>✓ Documentation</li>
        </ul>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating Code...</span>
          </>
        ) : (
          <>
            <span>💻</span>
            <span>Generate Production Code</span>
          </>
        )}
      </button>
    </div>
  );
}

