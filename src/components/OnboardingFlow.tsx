'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Sparkles, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoMindmapDisplay } from './DemoMindmapDisplay';

type OnboardingStep = 'welcome' | 'demo-generating' | 'demo-complete' | 'create-yours';

const DEMO_IDEA = 'A meal planning app for busy professionals that generates weekly menus based on dietary preferences and automatically creates shopping lists';

const LOADING_MESSAGES = [
  'Analyzing your app idea...',
  'Identifying key features...',
  'Mapping user workflows...',
  'Creating your mindmap...',
];

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [demoMindmapData, setDemoMindmapData] = useState<any>(null);
  const [userIdea, setUserIdea] = useState('');
  const [error, setError] = useState<string | null>(null);

  const trackEvent = async (eventName: string, eventData?: any) => {
    try {
      await fetch('/api/events/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_data: eventData || {},
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStep('demo-generating');
    
    await trackEvent('onboarding_demo_started');

    // Rotate loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: DEMO_IDEA,
          isDemo: true,
        }),
      });

      clearInterval(messageInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate demo mindmap');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setDemoMindmapData(result.data);
        setCurrentStep('demo-complete');
        await trackEvent('onboarding_demo_completed', {
          projectName: result.data.projectName,
          featureCount: result.data.features?.length || 0,
        });
      } else {
        throw new Error(result.error || 'Failed to generate demo mindmap');
      }
    } catch (err: any) {
      console.error('Error generating demo:', err);
      setError(err.message || 'Failed to generate demo. Please try again.');
      setCurrentStep('welcome');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateYourMindmap = async () => {
    if (!userIdea.trim()) {
      setError('Please enter your app idea');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentStep('demo-generating');
    
    await trackEvent('onboarding_user_mindmap_started', {
      ideaLength: userIdea.length,
    });

    // Rotate loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: userIdea.trim(),
          isDemo: false,
        }),
      });

      clearInterval(messageInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mindmap');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Save the mindmap and get project ID
        const saveResponse = await fetch('/api/save-mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mindmapData: result.data,
          }),
        });

        const saveResult = await saveResponse.json();
        
        if (saveResult.success && saveResult.projectId) {
          await trackEvent('onboarding_completed', {
            projectId: saveResult.projectId,
            projectName: result.data.projectName,
          });
          await completeOnboarding();
          
          // Redirect to the created mindmap
          router.push(`/create?mindmap=${encodeURIComponent(JSON.stringify(result.data))}`);
        } else {
          throw new Error('Failed to save mindmap');
        }
      } else {
        throw new Error(result.error || 'Failed to generate mindmap');
      }
    } catch (err: any) {
      console.error('Error generating mindmap:', err);
      setError(err.message || 'Failed to generate mindmap. Please try again.');
      setCurrentStep('create-yours');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkip = async () => {
    await trackEvent('onboarding_skipped');
    await completeOnboarding();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <Rocket className="w-24 h-24 text-purple-500 mx-auto mb-6 animate-pulse" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Welcome to CodeLaunch
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Let's start with a quick demo to show you how powerful AI-powered planning can be.
                We'll generate a complete mindmap for a meal planning app in seconds.
              </p>

              <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-6 mb-8 backdrop-blur-xl">
                <p className="text-purple-200 text-lg mb-2 font-semibold">Demo Idea:</p>
                <p className="text-white text-base">{DEMO_IDEA}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGenerateDemo}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Demo Mindmap
                </button>
                
                <button
                  onClick={handleSkip}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip Demo
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'demo-generating' && (
            <motion.div
              key="demo-generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-8"
              >
                <Rocket className="w-32 h-32 text-purple-500 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </h2>
              
              <div className="flex justify-center mb-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
              
              <p className="text-gray-400">
                This usually takes 10-15 seconds...
              </p>
            </motion.div>
          )}

          {currentStep === 'demo-complete' && demoMindmapData && (
            <motion.div
              key="demo-complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Demo Mindmap Generated!
                </h2>
                <p className="text-gray-300">
                  Here's what a complete mindmap looks like. Now create your own!
                </p>
              </div>

              <DemoMindmapDisplay mindmapData={demoMindmapData} />

              <div className="mt-8 text-center">
                <button
                  onClick={() => setCurrentStep('create-yours')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 mx-auto shadow-2xl hover:scale-105"
                >
                  Create My App
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'create-yours' && (
            <motion.div
              key="create-yours"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Create Your First Mindmap
                </h2>
                <p className="text-gray-300">
                  Describe your app idea and we'll generate a comprehensive mindmap with features, 
                  technical specs, and implementation details.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                <label className="block text-white font-semibold mb-3">
                  Your App Idea
                </label>
                <textarea
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                  className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleCreateYourMindmap}
                  disabled={isGenerating || !userIdea.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Mindmap
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSkip}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

