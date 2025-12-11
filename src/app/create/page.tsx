// src/app/create/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { EnhancedMindmapFlow } from '@/components/EnhancedMindmapFlow';
import { convertToEnhancedMindmap } from '@/lib/mindmap-converter';
import AIAssistantChatEnhanced from '@/components/AIAssistantChatEnhanced';
import FloatingMoodBoard from '@/components/FloatingMoodBoard';
import Header from '@/components/Header';
import FeatureBuilderPanel from '@/components/FeatureBuilderPanel';
import { MindmapData, Competitor, Feature } from '@/types/mindmap';
import { EnhancedFeature } from '@/types/enhanced-mindmap';
import { useMindmapLimit } from '@/hooks/useMindmapLimit';
import { SpaceBackground } from '@/components/ui/space-background';
import Link from 'next/link';
import { exportProjectAsZip } from '@/utils/exportUtils';
import MindmapTutorialOverlay from '@/components/MindmapTutorialOverlay';
import { useMindmapTutorial } from '@/hooks/useMindmapTutorial';
import { toast } from 'sonner';
import NextStepModal from '@/components/NextStepModal';
import ProgressBar, { calculateProgress } from '@/components/ProgressBar';
import { MessageCircle, Image as ImageIcon } from 'lucide-react';

// Debug logging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 DEBUG: EnhancedMindmapFlow imported:', typeof EnhancedMindmapFlow);
  console.log('🔍 DEBUG: EnhancedMindmapFlow component:', EnhancedMindmapFlow);
}

function CreateProjectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { canCreateMore, isSubscribed, remainingFreeMindmaps } = useMindmapLimit();
  
  // Tutorial system
  const {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
  } = useMindmapTutorial();
  
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [error, setError] = useState('');
  
  // Panel state
  const [showAIChat, setShowAIChat] = useState(false);  // Hidden by default for cleaner UX
  const [showMoodBoard, setShowMoodBoard] = useState(false);  // Hidden by default
  const [moodBoardImages, setMoodBoardImages] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // NextStepModal state
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [hasShownNextStepModal, setHasShownNextStepModal] = useState(false);
  
  // Feature Builder state
  const [selectedFeature, setSelectedFeature] = useState<EnhancedFeature | null>(null);
  
  // Ref to track if we've already processed the URL param (prevent infinite loop)
  const hasProcessedUrlParam = useRef(false);
  const [fromOnboarding, setFromOnboarding] = useState(false);

  // Debug logging at component render
  console.log('🔍 CREATE PAGE RENDER - mindmapData exists:', !!mindmapData);
  console.log('🔍 CREATE PAGE RENDER - searchParams:', searchParams.toString());

  // Pre-fill idea from URL params (from onboarding flow)
  useEffect(() => {
    const ideaParam = searchParams.get('idea');
    if (ideaParam && !idea) {
      const decodedIdea = decodeURIComponent(ideaParam);
      setIdea(decodedIdea);
      setFromOnboarding(true); // Flag that they came from onboarding
      console.log('📝 Pre-filled idea from onboarding:', decodedIdea);
    }
  }, [searchParams]); // Only depend on searchParams

  // Check for mindmap data from query params (from new-project page)
  useEffect(() => {
    // Only process once (prevent infinite loop)
    if (hasProcessedUrlParam.current || mindmapData) {
      return;
    }
    
    const mindmapParam = searchParams.get('mindmap');
    if (mindmapParam) {
      try {
        hasProcessedUrlParam.current = true; // Mark as processed
        const decodedData = JSON.parse(decodeURIComponent(mindmapParam));
        console.log('📥 Received mindmap data:', decodedData);
        console.log('📥 Has nodes:', decodedData?.nodes?.length);
        console.log('📥 Has edges:', decodedData?.edges?.length);
        console.log('📥 Has projectName:', decodedData?.projectName);
        console.log('📥 Has features:', decodedData?.features?.length);
        setMindmapData(decodedData);
        // Keep URL parameter - don't clear it
      } catch (err) {
        console.error('Failed to parse mindmap data from URL:', err);
        hasProcessedUrlParam.current = false; // Reset on error so we can retry
      }
    }
  }, [searchParams]); // Only depend on searchParams, not mindmapData (prevents infinite loop)

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && mindmapData) {
      console.log('🔍 DEBUG: Rendering EnhancedMindmapFlow with data:', mindmapData);
    }
  }, [mindmapData]);

  // Show toast when Feature Builder opens
  useEffect(() => {
    if (selectedFeature) {
      toast.success('🎉 Feature Builder opened! Expand features to see details', {
        duration: 5000,
      });
    }
  }, [selectedFeature]);

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'F' for fullscreen (only when not typing in input)
      if (mindmapData && (e.key === 'f' || e.key === 'F')) {
        if (!e.target || (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          if (!isFullscreen) {
            setShowAIChat(false);
          } else {
            setShowAIChat(true);
          }
        }
      }
      
      // Press 'Escape' to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setShowAIChat(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, mindmapData]);

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  const handleGenerate = async (message?: string) => {
    const ideaToUse = message?.trim() || idea.trim();
    
    if (!ideaToUse) {
      return; // Silently return - form validation will handle empty inputs
    }

    // Frontend check (API will also enforce, but this prevents unnecessary API calls)
    if (!canCreateMore) {
      setError('You\'ve reached your free mindmap limit. Please upgrade to Pro to continue creating mindmaps.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setIdea(ideaToUse); // Update state for consistency

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaToUse }),
      });

      const result = await response.json();

      // Handle limit reached error from API
      if (response.status === 403 && result.error === 'FREE_LIMIT_REACHED') {
        setError(result.message || 'You\'ve reached your free mindmap limit. Please upgrade to Pro.');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate mindmap');
      }

      // Success! Show mindmap and usage info
      setMindmapData(result.data);
      
      // Show NextStepModal to guide user
      if (!hasShownNextStepModal) {
        setTimeout(() => {
          setShowNextStepModal(true);
          setHasShownNextStepModal(true);
        }, 1500);
      }
      
      // Trigger tutorial for first-time users after mindmap generation
      if (!hasCompletedTutorial) {
        setTimeout(() => {
          startTutorial();
        }, 1000); // Small delay so user can see the mindmap first
      }
      
      // Show usage info if available
      if (result.usage && !result.usage.isProUser) {
        const remaining = result.usage.remaining;
        if (remaining !== 'unlimited') {
          // The useMindmapLimit hook will automatically refetch on next render
          // or we can trigger a manual refresh by updating a dependency
        }
      }
    } catch (err: any) {
      console.error('Error generating mindmap:', err);
      if (err.message?.includes('FREE_LIMIT_REACHED')) {
        setError('You\'ve reached your free mindmap limit. Please upgrade to Pro to continue.');
      } else {
        setError(err.message || 'Failed to generate mindmap. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!mindmapData || !user) return;

    try {
      const response = await fetch('/api/save-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mindmapData,
        }),
      });

      const result = await response.json();

      // Check if limit was reached during save
      if (response.status === 403 && result.error === 'FREE_LIMIT_REACHED') {
        setError(result.message || 'You\'ve reached your free mindmap limit. Please upgrade to Pro.');
        setMindmapData(null); // Clear the mindmap so user can't try to save again
        return;
      }

      if (result.success) {
        const message = isSubscribed 
          ? 'Mindmap saved successfully! You can continue working or go to dashboard.'
          : `Mindmap saved! You have ${result.remainingFreeMindmaps || remainingFreeMindmaps || 0} free mindmap${(result.remainingFreeMindmaps || remainingFreeMindmaps || 0) !== 1 ? 's' : ''} remaining.`;
        alert(message);
        // Stay on this page - user can use Dashboard button to navigate away
      } else {
        throw new Error(result.error || 'Failed to save mindmap');
      }
    } catch (err: any) {
      console.error('Error saving mindmap:', err);
      if (err.message?.includes('FREE_LIMIT_REACHED')) {
        setError('You\'ve reached your free mindmap limit. Please upgrade to Pro to continue.');
        setMindmapData(null);
      } else {
        alert('Failed to save mindmap: ' + err.message);
      }
    }
  };

  const handleGeneratePRD = async (nodeId: string, featureData: any) => {
    console.log('🚀 handleGeneratePRD called:', nodeId);
    
    if (!isSubscribed) {
      const upgrade = window.confirm(
        '🔒 PRD Generation is a Pro Feature\n\n' +
        'Generate comprehensive PRDs with:\n' +
        '• Technical specifications\n' +
        '• API documentation\n' +
        '• Data schemas\n' +
        '• Edge cases\n' +
        '• User stories\n\n' +
        'Upgrade to Pro?'
      );
      if (upgrade) window.location.href = '/#pricing';
      return;
    }

    if (!mindmapData) {
      alert('No mindmap data available');
      return;
    }

    try {
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: featureData,
          projectContext: {
            projectName: mindmapData.projectName,
            projectDescription: mindmapData.projectDescription,
            techStack: mindmapData.techStack,
            allFeatures: mindmapData.features,
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ PRD Generated!');
        // Update mindmap data with new PRD
        setMindmapData({
          ...mindmapData,
          features: mindmapData.features.map(f =>
            f.id === nodeId ? { ...f, prd: result.prd, hasPRD: true } : f
          )
        } as any);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert('Failed: ' + error.message);
    }
  };

  const exampleIdeas = [
    "A SaaS platform where therapists can manage appointments, client notes, and secure messaging",
    "An AI-powered chatbot for customer support with conversation history and analytics dashboard",
    "A mobile app for tracking daily habits with reminders, progress charts, and social sharing",
    "A project management tool for remote teams with kanban boards, time tracking, and video calls",
    "An e-commerce platform for digital art with creator profiles, NFT integration, and royalty tracking"
  ];

  const handleChatSubmit = async (message: string) => {
    await handleGenerate(message); // Pass message directly to avoid state timing issues
  };

  // Memoize the converted mindmap data to prevent infinite re-renders
  const enhancedMindmapData = useMemo(() => {
    if (!mindmapData) return null;
    
    return convertToEnhancedMindmap({
      projectName: mindmapData.projectName,
      projectDescription: mindmapData.projectDescription,
      description: mindmapData.projectDescription,
      competitors: mindmapData.competitors.map((c: Competitor) => ({
        name: c.name,
        url: c.url,
        strength: c.strength,
        ourAdvantage: c.ourAdvantage,
      })),
      techStack: mindmapData.techStack,
      features: mindmapData.features.map((f: Feature) => ({
        id: f.id,
        title: f.title,
        name: f.title,
        description: f.description,
        priority: f.priority,
      })),
      monetization: mindmapData.monetization,
      userPersona: mindmapData.userPersona ? {
        name: mindmapData.userPersona.name,
        title: mindmapData.userPersona.name,
        description: mindmapData.userPersona.description,
        painPoint: mindmapData.userPersona.painPoint,
        painPoints: [mindmapData.userPersona.painPoint],
      } : undefined,
      targetAudience: mindmapData.targetAudience,
    });
  }, [mindmapData]);

  // Helper to get the top priority feature for NextStepModal
  const getTopFeature = () => {
    if (!mindmapData?.features?.length) return undefined;
    const priorityOrder = ['must-have', 'high', 'medium', 'low'];
    const sorted = [...mindmapData.features].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority || 'medium');
      const bIndex = priorityOrder.indexOf(b.priority || 'medium');
      return aIndex - bIndex;
    });
    return sorted[0] ? {
      id: `feature-${sorted[0].id}`,
      title: sorted[0].title,
      description: sorted[0].description,
    } : undefined;
  };

  // Handler for starting with a specific feature from NextStepModal
  const handleStartWithFeature = (featureId: string) => {
    const feature = mindmapData?.features.find(f => `feature-${f.id}` === featureId);
    if (feature) {
      setSelectedFeature(feature as unknown as EnhancedFeature);
      toast.info('💡 Click "Generate PRD" to create detailed specs for this feature');
    }
  };

  // Calculate progress for the ProgressBar
  const { currentStage, completedStages } = useMemo(() => {
    return calculateProgress(mindmapData as any);
  }, [mindmapData]);

  // Debug logging before render decision
  console.log('🎯 Rendering decision - mindmapData:', mindmapData ? 'EXISTS' : 'NULL');
  if (mindmapData) {
    console.log('🎯 mindmapData structure:', {
      projectName: mindmapData.projectName,
      hasFeatures: !!mindmapData.features,
      featuresCount: mindmapData.features?.length,
      hasCompetitors: !!mindmapData.competitors,
      hasTechStack: !!mindmapData.techStack,
    });
  }

  return (
    <>
      {!mindmapData ? (
        <SpaceBackground variant="default">
          <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-4xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg backdrop-blur-sm">
                <p className="text-red-400 mb-3">{error}</p>
                {error.includes('limit') && (
                  <Link href="/#pricing">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-medium transition">
                      Upgrade to Pro →
                    </button>
                  </Link>
                )}
              </div>
            )}

            {/* Show remaining mindmaps for free users */}
            {!isSubscribed && remainingFreeMindmaps !== null && remainingFreeMindmaps < 3 && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg backdrop-blur-sm">
                <p className="text-purple-300 text-sm">
                  ⚠️ You have {remainingFreeMindmaps} free mindmap{remainingFreeMindmaps !== 1 ? 's' : ''} remaining. 
                  {remainingFreeMindmaps === 0 && ' Upgrade to Pro for unlimited mindmaps.'}
                </p>
              </div>
            )}

            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  What do you want to build?
                </h1>
                <p className="text-white/60 text-lg">
                  Describe your app idea and we'll create a feature roadmap
                </p>
              </div>

              {/* Show special message if from onboarding */}
              {fromOnboarding && (
                <div className="mb-6 text-center">
                  <p className="text-purple-400 mb-2 animate-pulse text-lg font-medium">
                    ✨ Your idea is ready! Click below to generate your mindmap:
                  </p>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const message = formData.get('ideaInput') as string;
                if (message?.trim()) {
                  console.log('📝 Calling handleGenerate with:', message);
                  handleGenerate(message.trim());
                }
              }} className="space-y-4">
                <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
                  <div className="p-4">
                    <textarea
                      name="ideaInput"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                      className="w-full min-h-[120px] px-4 py-3 resize-none bg-transparent border-none text-white/90 text-base focus:outline-none placeholder:text-white/30"
                      disabled={isGenerating}
                      required
                    />
                  </div>
                  <div className="px-4 pb-4 border-t border-white/[0.05] pt-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={isGenerating || !idea.trim()}
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                        fromOnboarding
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 animate-pulse'
                          : 'bg-white text-black hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:animate-none`}
                    >
                      {isGenerating ? (
                        <>
                          <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                          Generating...
                        </>
                      ) : fromOnboarding ? (
                        '🚀 Generate My First Mindmap'
                      ) : (
                        'Generate Mindmap'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            </div>
          </div>
        </SpaceBackground>
      ) : (
        <SpaceBackground variant="default">
          <div className="min-h-screen relative" style={{ height: isFullscreen ? '100vh' : 'auto' }}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{mindmapData?.projectName || 'Mindmap'}</h1>
                  <p className="text-sm text-gray-300 mt-1">Interactive Mindmap</p>
                </div>
                <div className="flex items-center gap-3">
                  {!isFullscreen && (
                    <Link href="/dashboard">
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl font-medium transition text-sm">
                        Dashboard
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar - Shows workflow stages */}
            {!isFullscreen && (
              <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
                <ProgressBar currentStage={currentStage} completedStages={completedStages} />
              </div>
            )}

            {/* Save Button + Fullscreen Toggle - Fixed Position Top Right */}
            <div className="fixed top-24 right-8 z-50 flex gap-3">
              {mindmapData && (
                <button
                  onClick={() => exportProjectAsZip(mindmapData)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Project (.zip)
                </button>
              )}

              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-2xl backdrop-blur-xl border border-green-400/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>💾</span>
                <span>Save Mindmap</span>
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>{isFullscreen ? '⬅️' : '⛶'}</span>
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>

            {/* Mindmap Display */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-40' : ''}`}>
              <div 
                className="w-full" 
                style={{ 
                  height: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
                  paddingTop: isFullscreen ? '0' : '140px'
                }}
              >
                {enhancedMindmapData && (
                  <EnhancedMindmapFlow 
                    key={`mindmap-${mindmapData?.projectName || 'mindmap'}-${mindmapData?.features?.length || 0}`}
                    data={enhancedMindmapData} 
                    onSave={handleSave}
                    onNodeClick={(feature) => setSelectedFeature(feature)}
                    onGeneratePRD={handleGeneratePRD}
                    isSubscribed={isSubscribed}
                  />
                )}
              </div>
            </div>

            {/* Floating toggle buttons for collapsed panels */}
            {!isFullscreen && (
              <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
                {!showAIChat && (
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg transition-all hover:scale-110"
                    title="Open AI Chat"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                )}
                {!showMoodBoard && (
                  <button
                    onClick={() => setShowMoodBoard(true)}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all hover:scale-110"
                    title="Open Mood Board"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}

            {/* Floating panels (hidden in fullscreen) */}
            {!isFullscreen && (
              <>
                {showAIChat && (
                  <div className="fixed bottom-4 right-24 z-40">
                    <AIAssistantChatEnhanced 
                      mindmapData={mindmapData!}
                      moodBoardImages={moodBoardImages}
                      isCollapsed={false}
                      onToggleCollapse={() => setShowAIChat(false)}
                    />
                  </div>
                )}
                {showMoodBoard && <FloatingMoodBoard />}
              </>
            )}
          </div>
        </SpaceBackground>
      )}

      {/* Next Step Modal - Guides users after mindmap generation */}
      <NextStepModal
        isOpen={showNextStepModal}
        onClose={() => setShowNextStepModal(false)}
        featureCount={mindmapData?.features?.length || 0}
        topFeature={getTopFeature()}
        onStartWithFeature={handleStartWithFeature}
        onExploreFirst={() => {
          setShowNextStepModal(false);
          toast.info('💡 Click any feature node to see details and generate PRDs');
        }}
      />
      
      {/* Feature Builder Panel */}
      {selectedFeature && mindmapData && enhancedMindmapData && (
        <FeatureBuilderPanel
          feature={selectedFeature}
          projectContext={{
            projectName: mindmapData.projectName,
            projectDescription: mindmapData.projectDescription || '',
            techStack: mindmapData.techStack,
            allFeatures: enhancedMindmapData.features,
          }}
          onClose={() => setSelectedFeature(null)}
          onSavePRD={async (featureId: string, prd: any) => {
            // Update the feature with PRD data
            console.log('PRD saved for feature:', featureId, prd);
            setSelectedFeature(null);
            // TODO: Update mindmapData with PRD
          }}
          onGenerateCode={async (featureId: string) => {
            // Generate code for the feature
            console.log('Generating code for feature:', featureId);
            // TODO: Call code generation API
          }}
        />
      )}
    </>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <CreateProjectPageContent />
    </Suspense>
  );
}

