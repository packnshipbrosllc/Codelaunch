'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lock, Copy, Download, Check, Sparkles, Code, Database, Server, Layout, Cpu, Zap } from 'lucide-react';
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
    mindmapId?: string; // For Supabase persistence
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
  { id: 1, title: 'User Stories', shortTitle: 'Stories', icon: '📝', description: 'Define what users need' },
  { id: 2, title: 'Technical Specs', shortTitle: 'Tech', icon: '⚙️', description: 'API & data models' },
  { id: 3, title: 'Dependencies', shortTitle: 'Deps', icon: '🔗', description: 'Build order' },
  { id: 4, title: 'Edge Cases', shortTitle: 'Edge', icon: '🛡️', description: 'Error handling' },
  { id: 5, title: 'Generate PRD', shortTitle: 'PRD', icon: '📄', description: 'Documentation', isPro: true },
  { id: 6, title: 'Generate Code', shortTitle: 'Code', icon: '💻', description: 'Production code', isPro: true }
];

// Code generation loading messages
const codeGenMessages = [
  { text: "Analyzing PRD requirements...", icon: Cpu },
  { text: "Architecting component structure...", icon: Layout },
  { text: "Generating database schemas...", icon: Database },
  { text: "Writing API endpoints...", icon: Server },
  { text: "Building frontend components...", icon: Code },
  { text: "Optimizing code patterns...", icon: Zap },
  { text: "Finalizing implementation...", icon: Check },
];

// Futuristic Loading Overlay Component
function CodeGenerationOverlay({ isVisible, elapsedTime }: { isVisible: boolean; elapsedTime: number }) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % codeGenMessages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentMessage = codeGenMessages[messageIndex];
  const IconComponent = currentMessage.icon;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-md px-8">
        {/* Main icon with glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-purple-500/30 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
            <IconComponent className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Current message */}
        <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
          {currentMessage.text}
        </h3>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {codeGenMessages.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === messageIndex 
                  ? 'bg-purple-500 scale-125' 
                  : idx < messageIndex 
                  ? 'bg-green-500' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Time info */}
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">
            ⏱️ Elapsed: <span className="text-purple-400 font-mono">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </p>
          <p className="text-gray-500 text-xs">
            Code generation typically takes 2-3 minutes
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="mt-6 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full animate-shimmer"
            style={{ 
              width: '100%',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
      `}</style>
    </div>
  );
}

// Step type for Progress Tracker
type StepItem = { id: number; title: string; shortTitle: string; icon: string; description: string; isPro?: boolean };

// Futuristic Progress Tracker Component
function ProgressTracker({ 
  stepsList, 
  currentStep, 
  isStepComplete,
  onStepClick,
  isProUser,
  isLoadingSubscription
}: { 
  stepsList: StepItem[];
  currentStep: number;
  isStepComplete: (id: number) => boolean;
  onStepClick: (id: number) => void;
  isProUser: boolean;
  isLoadingSubscription: boolean;
}) {
  const completedCount = stepsList.filter(s => isStepComplete(s.id)).length;
  const progressPercent = Math.round((completedCount / stepsList.length) * 100);

  return (
    <div className="bg-black/60 border-b border-purple-500/20 p-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(139,92,246,0.2)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 1.26} 126`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {progressPercent}%
            </span>
          </div>
          <div>
            <p className="text-white font-semibold">{completedCount}/{steps.length} Steps Complete</p>
            <p className="text-gray-400 text-xs">Feature production progress</p>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {stepsList.map((step) => {
            const isComplete = isStepComplete(step.id);
            const isCurrent = currentStep === step.id;
            const isLocked = step.isPro && (isLoadingSubscription || !isProUser);

            return (
              <button
                key={step.id}
                onClick={() => !isLocked && onStepClick(step.id)}
                className={`flex flex-col items-center group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Step circle */}
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300 border-2
                  ${isComplete 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : isCurrent 
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse shadow-lg shadow-purple-500/50' 
                    : isLocked
                    ? 'bg-gray-800/50 border-gray-600 text-gray-500'
                    : 'bg-gray-800/50 border-gray-600 text-gray-400 group-hover:border-purple-500/50'
                  }
                `}>
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                  
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                  )}
                </div>

                {/* Step label */}
                <span className={`
                  mt-2 text-xs font-medium transition-colors
                  ${isCurrent ? 'text-purple-400' : isComplete ? 'text-green-400' : 'text-gray-500'}
                `}>
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FeatureBuilderPanel({ 
  feature, 
  projectContext, 
  onClose,
  onSavePRD,
  onGenerateCode 
}: FeatureBuilderPanelProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { hasSubscription, isLoading: isLoadingSubscription } = useSubscription();
  const { remainingFreeMindmaps, mindmapsCreated, freeLimit, isLoading: isLoadingLimit, error: limitError } = useMindmapLimit();
  const isProUser = hasSubscription === true;

  // State for generated content
  const [generatedPRD, setGeneratedPRD] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [prdError, setPrdError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Timer for code generation
  useEffect(() => {
    if (isGeneratingCode) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGeneratingCode]);

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

  // AI Enhancement handler
  const handleEnhanceWithAI = async (stepType: 'userStories' | 'technicalSpecs' | 'edgeCases' | 'dependencies') => {
    setIsEnhancing(true);
    try {
      const prompt = getEnhancementPrompt(stepType, formData, feature);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          featureContext: {
            title: feature.title,
            description: feature.description,
          }
        })
      });

      if (!response.ok) throw new Error('Enhancement failed');
      
      const result = await response.json();
      const enhancedContent = result.content || result.message;

      if (stepType === 'userStories') {
        setFormData(prev => ({
          ...prev,
          userStories: prev.userStories + '\n\n' + enhancedContent,
        }));
      } else if (stepType === 'technicalSpecs') {
        setFormData(prev => ({
          ...prev,
          apiEndpoints: typeof prev.apiEndpoints === 'string' 
            ? prev.apiEndpoints + '\n\n' + enhancedContent
            : enhancedContent,
        }));
      } else if (stepType === 'edgeCases') {
        setFormData(prev => ({
          ...prev,
          edgeCases: prev.edgeCases + '\n\n' + enhancedContent,
          errorHandling: prev.errorHandling + '\n\n' + 'AI-suggested error handling strategies added above.',
        }));
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Failed to enhance with AI. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const getEnhancementPrompt = (stepType: string, formData: FormData, feature: EnhancedFeature): string => {
    switch (stepType) {
      case 'userStories':
        return `For a feature called "${feature.title}" (${feature.description}), enhance these user stories and add 2-3 more:

Current user stories:
${formData.userStories || 'None yet'}

Current acceptance criteria:
${formData.acceptanceCriteria || 'None yet'}

Please provide:
1. 2-3 additional user stories in "As a [user], I want to [action] so that [benefit]" format
2. 3-5 additional acceptance criteria

Return only the new content, not a repeat of existing content.`;

      case 'technicalSpecs':
        return `For a feature called "${feature.title}" (${feature.description}), suggest technical specifications:

Current API endpoints:
${typeof formData.apiEndpoints === 'string' ? formData.apiEndpoints : JSON.stringify(formData.apiEndpoints)}

Please suggest:
1. Additional API endpoints needed (format: METHOD /api/path - description)
2. Key database fields/models
3. React components needed
4. Third-party libraries that could help

Be specific and practical.`;

      case 'edgeCases':
        return `For a feature called "${feature.title}" (${feature.description}), identify edge cases and error handling:

Current edge cases:
${formData.edgeCases || 'None yet'}

Please identify:
1. 5-7 edge cases that could occur
2. How to handle each edge case
3. Error messages to show users
4. Fallback behaviors

Be specific to this feature.`;

      case 'dependencies':
        return `For a feature called "${feature.title}" (${feature.description}), what features or systems should be built first?

Consider: authentication, database setup, API infrastructure, shared components.`;

      default:
        return '';
    }
  };

  // Check if step is complete
  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return !!(formData.userStories.trim() && formData.acceptanceCriteria.trim());
      case 2: return !!(formData.apiEndpoints && (typeof formData.apiEndpoints === 'string' ? formData.apiEndpoints.trim() : formData.apiEndpoints.length > 0));
      case 3: return true;
      case 4: return !!(formData.edgeCases.trim());
      case 5: return !!generatedPRD;
      case 6: return !!generatedCode;
      default: return false;
    }
  };

  const handleStepClick = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    const isLocked = step?.isPro && (isLoadingSubscription || !isProUser);
    
    if (isLocked) {
      trackPaywallViewed(stepId === 5 ? 'prd_generation' : 'code_generation', 'step_click');
      setShowUpgradeModal(true);
    } else {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Code Generation Loading Overlay */}
        <CodeGenerationOverlay isVisible={isGeneratingCode} elapsedTime={elapsedTime} />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div>
            <h2 className="text-xl font-bold text-white">Feature Builder</h2>
            <p className="text-sm text-gray-400">{feature.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          stepsList={steps}
          currentStep={currentStep}
          isStepComplete={isStepComplete}
          onStepClick={handleStepClick}
          isProUser={isProUser}
          isLoadingSubscription={isLoadingSubscription}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <UserStoriesStep 
              feature={feature} 
              formData={formData} 
              setFormData={setFormData} 
              onEnhance={() => handleEnhanceWithAI('userStories')}
              isEnhancing={isEnhancing}
            />
          )}
          {currentStep === 2 && (
            <TechnicalSpecsStep 
              feature={feature} 
              projectContext={projectContext} 
              formData={formData} 
              setFormData={setFormData}
              onEnhance={() => handleEnhanceWithAI('technicalSpecs')}
              isEnhancing={isEnhancing}
            />
          )}
          {currentStep === 3 && (
            <DependenciesStep 
              feature={feature} 
              projectContext={projectContext} 
              formData={formData} 
              setFormData={setFormData}
            />
          )}
          {currentStep === 4 && (
            <EdgeCasesStep 
              feature={feature} 
              formData={formData} 
              setFormData={setFormData}
              onEnhance={() => handleEnhanceWithAI('edgeCases')}
              isEnhancing={isEnhancing}
            />
          )}
          {currentStep === 5 && (
            <GeneratePRDStep 
              feature={feature} 
              formData={formData} 
              projectContext={projectContext}
              onSavePRD={onSavePRD} 
              isGenerating={isGenerating} 
              setIsGenerating={setIsGenerating} 
              isProUser={isProUser} 
              remainingFreeMindmaps={remainingFreeMindmaps} 
              mindmapsCreated={mindmapsCreated} 
              freeLimit={freeLimit} 
              isLoadingLimit={isLoadingLimit} 
              limitError={limitError} 
              onUpgrade={() => { 
                trackPaywallViewed('prd_generation', 'button_click'); 
                trackUpgradeClicked('prd_button'); 
                setShowUpgradeModal(true); 
              }}
              generatedPRD={generatedPRD}
              setGeneratedPRD={setGeneratedPRD}
              prdError={prdError}
              setPrdError={setPrdError}
            />
          )}
          {currentStep === 6 && (
            <GenerateCodeStep 
              feature={feature} 
              formData={formData}
              projectContext={projectContext}
              generatedPRD={generatedPRD}
              onGenerateCode={onGenerateCode} 
              isGenerating={isGeneratingCode} 
              setIsGenerating={setIsGeneratingCode} 
              isProUser={isProUser} 
              remainingFreeMindmaps={remainingFreeMindmaps} 
              mindmapsCreated={mindmapsCreated} 
              freeLimit={freeLimit} 
              isLoadingLimit={isLoadingLimit} 
              limitError={limitError} 
              onUpgrade={() => { 
                trackPaywallViewed('code_generation', 'button_click'); 
                trackUpgradeClicked('code_button'); 
                setShowUpgradeModal(true); 
              }}
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
              codeError={codeError}
              setCodeError={setCodeError}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between p-4 border-t border-purple-500/20">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all text-sm"
            >
              ← Previous
            </button>
          ) : <div />}
          
          {currentStep < steps.length && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all text-sm"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={currentStep === 5 ? 'PRD Generation' : currentStep === 6 ? 'Code Generation' : undefined}
      />
    </div>
  );
}

// Step Components
function UserStoriesStep({ 
  feature, 
  formData, 
  setFormData,
  onEnhance,
  isEnhancing
}: { 
  feature: EnhancedFeature; 
  formData: FormData; 
  setFormData: (data: FormData) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">📝 User Stories & Requirements</h3>
        <p className="text-gray-400 text-sm">Define clear user stories and acceptance criteria.</p>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">User Stories</label>
        <textarea
          value={formData.userStories}
          onChange={(e) => setFormData({...formData, userStories: e.target.value})}
          placeholder="As a [user type], I want to [action] so that [benefit]..."
          className="w-full h-36 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">Acceptance Criteria</label>
        <textarea
          value={formData.acceptanceCriteria}
          onChange={(e) => setFormData({...formData, acceptanceCriteria: e.target.value})}
          placeholder="- Users can...\n- System should...\n- Data persists..."
          className="w-full h-36 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <button
        onClick={onEnhance}
        disabled={isEnhancing}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {isEnhancing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Enhance with AI</span>
          </>
        )}
      </button>
    </div>
  );
}

function TechnicalSpecsStep({ 
  feature, 
  projectContext, 
  formData, 
  setFormData,
  onEnhance,
  isEnhancing
}: { 
  feature: EnhancedFeature; 
  projectContext: any; 
  formData: FormData; 
  setFormData: (data: FormData) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">⚙️ Technical Specifications</h3>
        <p className="text-gray-400 text-sm">Define API endpoints, data models, and UI components.</p>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">API Endpoints</label>
        <textarea
          value={typeof formData.apiEndpoints === 'string' ? formData.apiEndpoints : JSON.stringify(formData.apiEndpoints, null, 2)}
          onChange={(e) => setFormData({...formData, apiEndpoints: e.target.value})}
          placeholder="POST /api/resource - Create new resource\nGET /api/resource/:id - Get resource..."
          className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">Data Models</label>
        <textarea
          value={typeof formData.dataModels === 'string' ? formData.dataModels : JSON.stringify(formData.dataModels, null, 2)}
          onChange={(e) => setFormData({...formData, dataModels: e.target.value})}
          placeholder="User { id, name, email, createdAt }..."
          className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
        />
      </div>

      <button 
        onClick={onEnhance}
        disabled={isEnhancing}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {isEnhancing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>AI-Enhance Specs</span>
          </>
        )}
      </button>
    </div>
  );
}

function DependenciesStep({ feature, projectContext, formData, setFormData }: { feature: EnhancedFeature; projectContext: any; formData: FormData; setFormData: (data: FormData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">🔗 Dependencies & Build Order</h3>
        <p className="text-gray-400 text-sm">Select features that must be built before this one.</p>
      </div>

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
              <span className="text-white text-sm">{f.title}</span>
            </label>
          ))}
        {projectContext.allFeatures.filter((f: EnhancedFeature) => f.id !== feature.id).length === 0 && (
          <p className="text-gray-500 text-sm italic">No other features to depend on</p>
        )}
      </div>
    </div>
  );
}

function EdgeCasesStep({ 
  feature, 
  formData, 
  setFormData,
  onEnhance,
  isEnhancing
}: { 
  feature: EnhancedFeature; 
  formData: FormData; 
  setFormData: (data: FormData) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">🛡️ Edge Cases & Error Handling</h3>
        <p className="text-gray-400 text-sm">Think through failure scenarios and how to handle them.</p>
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">Edge Cases</label>
        <textarea
          value={formData.edgeCases}
          onChange={(e) => setFormData({...formData, edgeCases: e.target.value})}
          placeholder="- What if user enters invalid data?\n- What if API is down?\n- What if network fails?"
          className="w-full h-36 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-white font-semibold mb-2 text-sm">Error Handling Strategy</label>
        <textarea
          value={formData.errorHandling}
          onChange={(e) => setFormData({...formData, errorHandling: e.target.value})}
          placeholder="- Show user-friendly error messages\n- Retry failed requests\n- Log errors for debugging"
          className="w-full h-36 bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <button
        onClick={onEnhance}
        disabled={isEnhancing}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {isEnhancing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Finding Edge Cases...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>AI-Identify Edge Cases</span>
          </>
        )}
      </button>
    </div>
  );
}

function GeneratePRDStep({ 
  feature, 
  formData, 
  projectContext,
  onSavePRD, 
  isGenerating, 
  setIsGenerating, 
  isProUser, 
  remainingFreeMindmaps, 
  mindmapsCreated, 
  freeLimit, 
  isLoadingLimit, 
  limitError, 
  onUpgrade,
  generatedPRD,
  setGeneratedPRD,
  prdError,
  setPrdError
}: { 
  feature: EnhancedFeature; 
  formData: FormData; 
  projectContext: any;
  onSavePRD: (featureId: string, prd: any) => void; 
  isGenerating: boolean; 
  setIsGenerating: (val: boolean) => void; 
  isProUser: boolean; 
  remainingFreeMindmaps: number | null; 
  mindmapsCreated: number; 
  freeLimit: number; 
  isLoadingLimit: boolean; 
  limitError: string | null; 
  onUpgrade: () => void;
  generatedPRD: any;
  setGeneratedPRD: (prd: any) => void;
  prdError: string | null;
  setPrdError: (error: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!isProUser) { onUpgrade(); return; }

    setIsGenerating(true);
    setPrdError(null);
    
    try {
      const response = await fetch('/api/generate-feature-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: feature.id,
          featureName: feature.title,
          featureDescription: feature.description,
          mindmapId: projectContext.mindmapId, // For Supabase persistence
          projectContext: { projectName: projectContext.projectName, techStack: projectContext.techStack },
          userStories: formData.userStories,
          acceptanceCriteria: formData.acceptanceCriteria.split('\n').filter(c => c.trim()),
          apiEndpoints: formData.apiEndpoints,
          dependencies: formData.dependencies,
          edgeCases: formData.edgeCases.split('\n').filter(c => c.trim()),
          errorHandling: formData.errorHandling,
        })
      });
      
      const result = await response.json();
      if (result.success && result.prd) {
        setGeneratedPRD(result.prd);
        onSavePRD(feature.id, result.prd);
      } else {
        setPrdError(result.error || 'Failed to generate PRD');
      }
    } catch (error: any) {
      setPrdError(error.message || 'Failed to generate PRD');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedPRD, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">📄 Generate PRD</h3>
        <p className="text-gray-400 text-sm">Create comprehensive documentation from your specifications.</p>
      </div>

      {generatedPRD ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-400 flex items-center gap-2">
              <Check className="w-5 h-5" /> PRD Generated
            </span>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(generatedPRD, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${feature.title.replace(/\s+/g, '-')}-prd.json`;
                  a.click();
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto text-sm">
            {generatedPRD.overview && <p className="text-gray-300 mb-3">{generatedPRD.overview}</p>}
            {generatedPRD.userStories?.length > 0 && (
              <div className="mb-3">
                <h4 className="text-purple-400 font-semibold mb-1">User Stories ({generatedPRD.userStories.length})</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  {generatedPRD.userStories.slice(0, 2).map((s: any, i: number) => (
                    <li key={i}>• As a {s.role || s.persona}, I want to {s.action}...</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-2">PRD will include:</p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>✓ User stories & acceptance criteria</li>
            <li>✓ Technical specifications & API docs</li>
            <li>✓ Database schema & dependencies</li>
            <li>✓ Implementation steps & testing</li>
          </ul>
        </div>
      )}

      {prdError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">❌ {prdError}</p>
        </div>
      )}

      {!isProUser && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Pro Feature</p>
            <p className="text-gray-400 text-xs">Upgrade to generate PRDs</p>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm ${
          isProUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Generating PRD...</span>
          </>
        ) : generatedPRD ? (
          <><span>🔄</span><span>Regenerate PRD</span></>
        ) : isProUser ? (
          <><span>📄</span><span>Generate PRD</span></>
        ) : (
          <><Lock className="w-4 h-4" /><span>Upgrade to Generate</span></>
        )}
      </button>
    </div>
  );
}

function GenerateCodeStep({ 
  feature, 
  formData,
  projectContext,
  generatedPRD,
  onGenerateCode, 
  isGenerating, 
  setIsGenerating, 
  isProUser, 
  remainingFreeMindmaps, 
  mindmapsCreated, 
  freeLimit, 
  isLoadingLimit, 
  limitError, 
  onUpgrade,
  generatedCode,
  setGeneratedCode,
  codeError,
  setCodeError
}: { 
  feature: EnhancedFeature; 
  formData: FormData;
  projectContext: any;
  generatedPRD: any;
  onGenerateCode: (featureId: string) => void; 
  isGenerating: boolean; 
  setIsGenerating: (val: boolean) => void; 
  isProUser: boolean; 
  remainingFreeMindmaps: number | null; 
  mindmapsCreated: number; 
  freeLimit: number; 
  isLoadingLimit: boolean; 
  limitError: string | null; 
  onUpgrade: () => void;
  generatedCode: any;
  setGeneratedCode: (code: any) => void;
  codeError: string | null;
  setCodeError: (error: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState(0);

  const handleGenerate = async () => {
    if (!isProUser) { onUpgrade(); return; }

    setIsGenerating(true);
    setCodeError(null);
    
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: feature.id,
          featureName: feature.title,
          featureDescription: feature.description,
          mindmapId: projectContext.mindmapId, // For Supabase persistence
          projectContext: { projectName: projectContext.projectName, techStack: projectContext.techStack },
          prd: generatedPRD,
          userStories: formData.userStories,
          apiEndpoints: formData.apiEndpoints,
          dataModels: formData.dataModels,
          uiComponents: formData.uiComponents,
        })
      });
      
      const result = await response.json();
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        onGenerateCode(feature.id);
      } else {
        setCodeError(result.error || 'Failed to generate code');
      }
    } catch (error: any) {
      setCodeError(error.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const files = generatedCode?.files || [];
  const currentFile = files[activeFile];

  const handleCopy = () => {
    if (currentFile?.content) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">💻 Generate Code</h3>
        <p className="text-gray-400 text-sm">Generate production-ready code from your specifications.</p>
      </div>

      {!generatedPRD && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <p className="text-yellow-400 text-sm">💡 Tip: Generate a PRD first for better code quality</p>
        </div>
      )}

      {generatedCode && files.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-green-400 flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" /> {files.length} files generated
            </span>
            <button 
              onClick={() => {
                const allCode = files.map((f: any) => `// ${f.name}\n${f.content}`).join('\n\n');
                const blob = new Blob([allCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${feature.title.replace(/\s+/g, '-')}-code.txt`;
                a.click();
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Download All
            </button>
          </div>
          
          {/* File tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {files.map((file: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveFile(idx)}
                className={`px-3 py-1.5 rounded-t-lg text-xs whitespace-nowrap transition-colors ${
                  activeFile === idx ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                {file.name || `File ${idx + 1}`}
              </button>
            ))}
          </div>
          
          {/* Code viewer */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs text-gray-400">{currentFile?.name}</span>
              <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 text-xs text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
              <code>{currentFile?.content || 'No content'}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-2">Generated code will include:</p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>✓ React/Next.js components</li>
            <li>✓ API routes with error handling</li>
            <li>✓ TypeScript types</li>
            <li>✓ Database schemas</li>
          </ul>
        </div>
      )}

      {codeError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">❌ {codeError}</p>
        </div>
      )}

      {!isProUser && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Pro Feature</p>
            <p className="text-gray-400 text-xs">Upgrade to generate code</p>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm ${
          isProUser
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
            : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
        }`}
      >
        {isGenerating ? (
          <span>Generating... (see overlay)</span>
        ) : generatedCode ? (
          <><span>🔄</span><span>Regenerate Code</span></>
        ) : isProUser ? (
          <><span>💻</span><span>Generate Code</span></>
        ) : (
          <><Lock className="w-4 h-4" /><span>Upgrade to Generate</span></>
        )}
      </button>
    </div>
  );
}
