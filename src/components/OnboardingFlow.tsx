// FILE PATH: src/components/OnboardingFlow.tsx
// Multi-step onboarding flow with interactive demo

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import DemoMindmapDisplay from '@/components/DemoMindmapDisplay';
import { Sparkles, Rocket, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

type OnboardingStep = 'welcome' | 'demo' | 'create' | 'complete';

export default function OnboardingFlow() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userIdea, setUserIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Track when component mounts (welcome step loaded)
  useEffect(() => {
    console.log('Onboarding: Welcome step loaded');
  }, []);

  const handleCompleteOnboarding = async () => {
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.push('/dashboard');
    }
  };

  const handleSkipToCreate = async () => {
    console.log('Onboarding: User skipped');
    await handleCompleteOnboarding();
    router.push('/create');
  };

  const handleGenerateFromOnboarding = async () => {
    console.log('Onboarding: User submitted idea:', userIdea);
    
    if (!userIdea.trim() || userIdea.trim().length < 10) {
      setError('Please describe your app idea (at least 10 characters)');
      return;
    }

    console.log('Onboarding: Generation started');
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: userIdea.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate mindmap');
      }

      console.log('Onboarding: Generation succeeded, completing onboarding');
      // Mark onboarding as complete and redirect to the new mindmap
      await handleCompleteOnboarding();
      
      // Redirect to create page with the idea pre-filled
      router.push(`/create?idea=${encodeURIComponent(userIdea.trim())}`);
    } catch (err: any) {
      console.error('Error generating mindmap:', err);
      setError(err.message || 'Failed to generate mindmap. Please try again.');
      setIsGenerating(false);
    }
  };

  // Welcome Step
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to CodeLaunch! 🚀
            </h1>
            <p className="text-xl text-gray-300">
              Transform your app ideas into production-ready plans in minutes
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Here's what CodeLaunch does:
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Mindmaps</h3>
                  <p className="text-gray-400">
                    Describe your app idea and instantly get a comprehensive feature mindmap
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Detailed Feature Planning</h3>
                  <p className="text-gray-400">
                    Click any feature to see user stories, technical specs, and implementation details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Production-Ready PRDs</h3>
                  <p className="text-gray-400">
                    Generate professional Product Requirement Documents ready for developers
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                console.log('Onboarding: Moved to demo step');
                setCurrentStep('demo');
              }}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Show Me How It Works
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSkipToCreate}
              className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-600"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Demo Step
  if (currentStep === 'demo') {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Here's an Example Project
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              This is what CodeLaunch generates from a simple app idea
            </p>
          </div>

          <DemoMindmapDisplay />

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => {
                console.log('Onboarding: Moved to create step');
                setCurrentStep('create');
              }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Create My Own Project
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setCurrentStep('welcome')}
              className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-600"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Step
  if (currentStep === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Now It's Your Turn! ✨
            </h1>
            <p className="text-xl text-gray-300">
              Describe your app idea and watch the magic happen
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <label className="block text-lg font-semibold text-white mb-4">
              What app do you want to build?
            </label>
            
            <textarea
              value={userIdea}
              onChange={(e) => setUserIdea(e.target.value)}
              placeholder="Example: A fitness app that helps users track their workouts, set goals, and connect with friends for motivation. It should have progress charts, workout plans, and social features."
              className="w-full h-40 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={isGenerating}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGenerateFromOnboarding}
                disabled={isGenerating || !userIdea.trim()}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                onClick={() => setCurrentStep('demo')}
                disabled={isGenerating}
                className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-600 disabled:opacity-50"
              >
                Back
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300 text-center">
                💡 <strong>Tip:</strong> Be specific! The more details you provide, the better your mindmap will be.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleSkipToCreate}
              className="text-gray-400 hover:text-white transition-colors underline"
            >
              Skip and explore on my own
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
