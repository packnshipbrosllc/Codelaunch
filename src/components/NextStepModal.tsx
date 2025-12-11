// Next Step Modal - Guides users after mindmap generation
// Location: src/components/NextStepModal.tsx

'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Sparkles, ArrowRight, MousePointerClick } from 'lucide-react';

interface NextStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureCount: number;
  topFeature?: { id: string; title: string; description?: string };
  onStartWithFeature: (featureId: string) => void;
  onExploreFirst: () => void;
}

export default function NextStepModal({
  isOpen,
  onClose,
  featureCount,
  topFeature,
  onStartWithFeature,
  onExploreFirst,
}: NextStepModalProps) {
  const handleStartWithFeature = () => {
    if (topFeature) {
      onStartWithFeature(topFeature.id);
    }
    onClose();
  };

  const handleExploreFirst = () => {
    onExploreFirst();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-purple-500/30 shadow-2xl shadow-purple-500/20 transition-all">
                {/* Celebration Header */}
                <div className="relative overflow-hidden px-8 pt-8 pb-6">
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
                  
                  <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 animate-pulse">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    
                    <Dialog.Title className="text-3xl font-bold text-white mb-2">
                      🎉 Your Mindmap is Ready!
                    </Dialog.Title>
                    
                    <p className="text-gray-300 text-lg">
                      We've generated <span className="text-purple-400 font-semibold">{featureCount} features</span> for your app
                    </p>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="px-8 py-6 border-t border-white/10">
                  {topFeature ? (
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                        Recommended Next Step
                      </p>
                      
                      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <p className="text-white font-semibold text-lg mb-1">
                          {topFeature.title}
                        </p>
                        {topFeature.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {topFeature.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-purple-400 text-sm">
                          <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs font-medium">
                            Highest Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">
                      Explore your features to get started
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-8 pb-6 space-y-3">
                  {topFeature && (
                    <button
                      onClick={handleStartWithFeature}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/25"
                    >
                      Start with "{topFeature.title}"
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleExploreFirst}
                    className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-xl transition-all border border-white/10"
                  >
                    Let me explore the mindmap first
                  </button>
                </div>

                {/* Tip */}
                <div className="px-8 pb-6">
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <MousePointerClick className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-300">
                      <span className="font-medium">Pro tip:</span> Click any feature node in the mindmap to see details and generate a detailed PRD (Product Requirements Document).
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

