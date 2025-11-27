// Mindmap Tutorial Overlay Component
// Location: src/components/MindmapTutorialOverlay.tsx

'use client';

import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface MindmapTutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: 'Welcome to Your Mindmap! 🎉',
    description: 'This is your project architecture. Each node represents a feature, competitor, persona, or tech stack item.',
    icon: '🗺️',
  },
  {
    id: 2,
    title: 'Click Any Node',
    description: 'Click on any feature node to open the Feature Builder. This is where you can generate PRDs and production code!',
    icon: '👆',
  },
  {
    id: 3,
    title: 'Explore Features',
    description: 'Double-click nodes to expand and see details. Use the Feature Builder to turn ideas into production-ready code.',
    icon: '✨',
  },
  {
    id: 4,
    title: 'Ready to Build!',
    description: 'You\'re all set! Start clicking nodes to explore and build your project. Pro users can generate PRDs and code instantly.',
    icon: '🚀',
  },
];

export default function MindmapTutorialOverlay({
  isVisible,
  onComplete,
  onSkip,
}: MindmapTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Tutorial Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-purple-900/90 to-black/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden pointer-events-auto">
          {/* Space Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
            {/* Animated stars */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                    <span className="text-2xl">{currentStepData.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                      {currentStepData.title}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Step {currentStep + 1} of {tutorialSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {currentStepData.description}
              </p>

              {/* Progress Indicator */}
              <div className="flex gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      index <= currentStep
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all border border-gray-700"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 flex items-center gap-2"
                >
                  {isLastStep ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Get Started!</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

