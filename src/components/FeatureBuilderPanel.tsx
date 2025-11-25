'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { EnhancedFeature } from '@/types/enhanced-mindmap';
import { Feature } from '@/types/mindmap';
import { useSubscription } from '@/hooks/useSubscription';
import { useMindmapLimit } from '@/hooks/useMindmapLimit';
import UpgradeModal from '@/components/UpgradeModal';
import { trackPaywallViewed, trackUpgradeClicked } from '@/utils/analytics';

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
  apiEndpoints: Array<{ method: string; path: string; description: string }> | string;
  dataModels: Record<string, any> | string;
  uiComponents: string[] | string;
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { hasSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const { remainingFreeMindmaps, mindmapsCreated, freeLimit, isLoading: isLoadingLimit, error: limitError } = useMindmapLimit();
  const isProUser = hasSubscription === true;

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
              const isProFeature = step.id === 5 || step.id === 6; // PRD and Code generation are Pro features
              const isLocked = isProFeature && !isProUser;
              
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (isLocked) {
                      trackPaywallViewed(step.id === 5 ? 'prd_generation' : 'code_generation', 'step_click');
                      setShowUpgradeModal(true);
                    } else {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : isCompleted
                      ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                      : isLocked
                      ? 'bg-gray-800/30 border border-gray-700/50 text-gray-500 cursor-not-allowed opacity-60'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {step.title}
                        {isProFeature && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-70 mt-1">{step.description}</div>
                    </div>
                    {isLocked && (
                      <Lock className="w-4 h-4 text-yellow-400" />
                    )}
                    {isCompleted && !isLocked && (
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
          {currentStep === 5 && <GeneratePRDStep feature={feature} formData={formData} onSavePRD={onSavePRD} isGenerating={isGenerating} setIsGenerating={setIsGenerating} isProUser={isProUser} remainingFreeMindmaps={remainingFreeMindmaps} mindmapsCreated={mindmapsCreated} freeLimit={freeLimit} onUpgrade={() => { trackPaywallViewed('prd_generation', 'button_click'); trackUpgradeClicked('prd_button'); setShowUpgradeModal(true); }} />}
          {currentStep === 6 && <GenerateCodeStep feature={feature} formData={formData} onGenerateCode={onGenerateCode} isGenerating={isGenerating} setIsGenerating={setIsGenerating} isProUser={isProUser} remainingFreeMindmaps={remainingFreeMindmaps} mindmapsCreated={mindmapsCreated} freeLimit={freeLimit} onUpgrade={() => { trackPaywallViewed('code_generation', 'button_click'); trackUpgradeClicked('code_button'); setShowUpgradeModal(true); }} />}

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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={currentStep === 5 ? 'PRD Generation' : currentStep === 6 ? 'Code Generation' : undefined}
      />
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
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-bold text-white mb-2">⚙️ Technical Specifications</h3>
        <p className="text-gray-400 mb-6">
          Define the technical architecture for this feature
        </p>
      </div>

      {/* API Endpoints Section with Guidance */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span>🔌</span>
          <span>API Endpoints</span>
        </h4>
        
        {/* Helpful Guidance Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>What are API Endpoints?</span>
          </h5>
          <p className="text-sm text-gray-300 mb-3">
            API endpoints are the URLs your frontend uses to communicate with your backend. 
            Think of them as doorways to different functions of your app.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <span className="text-white font-medium">GET</span>
                <span className="text-gray-400"> - Retrieve data (e.g., </span>
                <code className="text-blue-300 bg-black/30 px-1 rounded">GET /api/users/:id</code>
                <span className="text-gray-400"> to get user info)</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <span className="text-white font-medium">POST</span>
                <span className="text-gray-400"> - Create new data (e.g., </span>
                <code className="text-blue-300 bg-black/30 px-1 rounded">POST /api/workouts</code>
                <span className="text-gray-400"> to create workout)</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <span className="text-white font-medium">PUT/PATCH</span>
                <span className="text-gray-400"> - Update existing data (e.g., </span>
                <code className="text-blue-300 bg-black/30 px-1 rounded">PATCH /api/users/:id</code>
                <span className="text-gray-400">)</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <span className="text-white font-medium">DELETE</span>
                <span className="text-gray-400"> - Remove data (e.g., </span>
                <code className="text-blue-300 bg-black/30 px-1 rounded">DELETE /api/workouts/:id</code>
                <span className="text-gray-400">)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-blue-300">Example for "{feature.title}":</span>
              <br/>
              If your feature tracks user workouts, you might need:
              <br/>
              • <code className="bg-black/30 px-1">POST /api/workouts</code> - Create new workout
              <br/>
              • <code className="bg-black/30 px-1">GET /api/workouts/:id</code> - Get specific workout
              <br/>
              • <code className="bg-black/30 px-1">GET /api/workouts/user/:userId</code> - Get all user's workouts
            </p>
          </div>
        </div>

        {/* API Endpoints Input */}
        <div>
          <label className="block text-white font-semibold mb-2">Define Your API Endpoints</label>
          <p className="text-sm text-gray-400 mb-3">
            List the API endpoints this feature needs. Be specific about the HTTP method and path.
          </p>
          <textarea
            value={typeof formData.apiEndpoints === 'string' ? formData.apiEndpoints : JSON.stringify(formData.apiEndpoints, null, 2)}
            onChange={(e) => setFormData({...formData, apiEndpoints: e.target.value})}
            placeholder="Example:
POST /api/meals - Create a new meal entry
GET /api/meals/:id - Get specific meal details
GET /api/meals/user/:userId - Get all meals for a user
PATCH /api/meals/:id - Update meal information
DELETE /api/meals/:id - Delete a meal"
            className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* Data Models Section */}
      <div>
        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span>🗄️</span>
          <span>Data Models</span>
        </h4>
        <p className="text-sm text-gray-400 mb-3">
          Define the structure of data this feature will store in the database
        </p>
        <textarea
          value={typeof formData.dataModels === 'string' ? formData.dataModels : JSON.stringify(formData.dataModels, null, 2)}
          onChange={(e) => setFormData({...formData, dataModels: e.target.value})}
          placeholder="Example:
Meal {
  id: string (UUID)
  userId: string (foreign key)
  name: string
  calories: number
  protein: number (grams)
  carbs: number (grams)
  fat: number (grams)
  timestamp: date
  mealType: enum (breakfast, lunch, dinner, snack)
}"
          className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
        />
      </div>

      {/* UI Components Section */}
      <div>
        <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span>🎨</span>
          <span>UI Components</span>
        </h4>
        <p className="text-sm text-gray-400 mb-3">
          List the user interface components needed for this feature
        </p>
        <textarea
          value={Array.isArray(formData.uiComponents) ? formData.uiComponents.join('\n') : formData.uiComponents}
          onChange={(e) => setFormData({...formData, uiComponents: e.target.value.split('\n').filter(c => c.trim())})}
          placeholder="Example:
- MealForm (form to add/edit meals)
- MealCard (displays individual meal with macros)
- DailyMacrosSummary (shows daily totals with progress bars)
- MealHistory (list of past meals with filters)
- MacroChart (visual chart of macro distribution)"
          className="w-full h-40 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* AI Enhancement Button */}
      <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
        <span>✨</span>
        <span>AI-Enhance Technical Specs</span>
      </button>
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
              .filter((f: EnhancedFeature) => f.id !== feature.id)
              .map((f: EnhancedFeature) => (
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

function GeneratePRDStep({ feature, formData, onSavePRD, isGenerating, setIsGenerating, isProUser, remainingFreeMindmaps, mindmapsCreated, freeLimit, onUpgrade }: { feature: EnhancedFeature; formData: FormData; onSavePRD: (featureId: string, prd: any) => void; isGenerating: boolean; setIsGenerating: (val: boolean) => void; isProUser: boolean; remainingFreeMindmaps: number | null; mindmapsCreated: number; freeLimit: number; onUpgrade: () => void }) {
  const handleGenerate = async () => {
    if (!isProUser) {
      onUpgrade();
      return;
    }

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

      {!isProUser && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-300 font-semibold mb-1">Pro Feature</h4>
              <p className="text-gray-300 text-sm mb-2">
                Generate comprehensive PRDs with detailed documentation. Upgrade to Pro to unlock this feature.
              </p>
              {!isLoadingLimit && remainingFreeMindmaps !== null && (
                <p className="text-yellow-400 text-xs font-medium flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{mindmapsCreated} of {freeLimit} free mindmaps used</span>
                </p>
              )}
              {limitError && (
                <p className="text-red-400 text-xs mt-2">{limitError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
          isProUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating PRD...</span>
          </>
        ) : isProUser ? (
          <>
            <span>📄</span>
            <span>Generate Comprehensive PRD</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Upgrade to Generate PRD</span>
          </>
        )}
      </button>
    </div>
  );
}

function GenerateCodeStep({ feature, formData, onGenerateCode, isGenerating, setIsGenerating, isProUser, remainingFreeMindmaps, mindmapsCreated, freeLimit, onUpgrade }: { feature: EnhancedFeature; formData: FormData; onGenerateCode: (featureId: string) => void; isGenerating: boolean; setIsGenerating: (val: boolean) => void; isProUser: boolean; remainingFreeMindmaps: number | null; mindmapsCreated: number; freeLimit: number; onUpgrade: () => void }) {
  const handleGenerate = async () => {
    if (!isProUser) {
      onUpgrade();
      return;
    }

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

      {!isProUser && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-300 font-semibold mb-1">Pro Feature</h4>
              <p className="text-gray-300 text-sm mb-2">
                Generate production-ready code with full-stack components, API routes, and database schemas. Upgrade to Pro to unlock this feature.
              </p>
              {!isLoadingLimit && remainingFreeMindmaps !== null && (
                <p className="text-yellow-400 text-xs font-medium flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{mindmapsCreated} of {freeLimit} free mindmaps used</span>
                </p>
              )}
              {limitError && (
                <p className="text-red-400 text-xs mt-2">{limitError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
          isProUser
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
            : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating Code...</span>
          </>
        ) : isProUser ? (
          <>
            <span>💻</span>
            <span>Generate Production Code</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Upgrade to Generate Code</span>
          </>
        )}
      </button>
    </div>
  );
}

