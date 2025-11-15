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
import { MindmapData, Competitor, Feature } from '@/types/mindmap';
import { useMindmapLimit } from '@/hooks/useMindmapLimit';
import { SpaceBackground } from '@/components/ui/space-background';
import Link from 'next/link';

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
  
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [error, setError] = useState('');
  
  // Panel state
  const [showAIChat, setShowAIChat] = useState(true);
  const [moodBoardImages, setMoodBoardImages] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ref to track if we've already processed the URL param (prevent infinite loop)
  const hasProcessedUrlParam = useRef(false);

  // Debug logging at component render
  console.log('🔍 CREATE PAGE RENDER - mindmapData exists:', !!mindmapData);
  console.log('🔍 CREATE PAGE RENDER - searchParams:', searchParams.toString());

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

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('Please provide an app idea');
      return;
    }

    // Frontend check (API will also enforce, but this prevents unnecessary API calls)
    if (!canCreateMore) {
      setError('You\'ve reached your free mindmap limit. Please upgrade to Pro to continue creating mindmaps.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
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

  const exampleIdeas = [
    "A SaaS platform where therapists can manage appointments, client notes, and secure messaging",
    "An AI-powered chatbot for customer support with conversation history and analytics dashboard",
    "A mobile app for tracking daily habits with reminders, progress charts, and social sharing",
    "A project management tool for remote teams with kanban boards, time tracking, and video calls",
    "An e-commerce platform for digital art with creator profiles, NFT integration, and royalty tracking"
  ];

  const handleChatSubmit = async (message: string) => {
    setIdea(message);
    await handleGenerate();
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
    <SpaceBackground variant="default">
      {!mindmapData ? (
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

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const message = formData.get('ideaInput') as string;
                if (message?.trim()) {
                  console.log('📝 Calling handleChatSubmit with:', message);
                  handleChatSubmit(message.trim());
                }
              }} className="space-y-4">
                <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
                  <div className="p-4">
                    <textarea
                      name="ideaInput"
                      placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                      className="w-full min-h-[120px] px-4 py-3 resize-none bg-transparent border-none text-white/90 text-base focus:outline-none placeholder:text-white/30"
                      disabled={isGenerating}
                      required
                    />
                  </div>
                  <div className="px-4 pb-4 border-t border-white/[0.05] pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-lg text-sm font-medium transition-all bg-white text-black hover:bg-gray-100 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Mindmap'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">✅ Mindmap Generated!</h1>
            <p className="text-gray-400 mb-4">Project: {mindmapData.projectName}</p>
            <p className="text-gray-400 mb-4">Features: {mindmapData.features?.length || 0}</p>
            <pre className="text-left text-xs text-gray-500 bg-gray-800 p-4 rounded max-w-2xl mx-auto overflow-auto max-h-96">
              {JSON.stringify(mindmapData, null, 2)}
            </pre>
            <button 
              onClick={() => setMindmapData(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </SpaceBackground>
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

