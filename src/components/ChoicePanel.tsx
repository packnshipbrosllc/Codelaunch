// components/ChoicePanel.tsx
'use client';

import { useState } from 'react';
import { DecisionNode, Choice } from '@/types/decision-tree';
import { educationalTooltips } from '@/data/decision-tree';

interface ChoicePanelProps {
  question: DecisionNode;
  onSelect: (choice: Choice) => void;
  onClose: () => void;
}

export default function ChoicePanel({ question, onSelect, onClose }: ChoicePanelProps) {
  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);
  const [showEducational, setShowEducational] = useState(false);

  const handleSelect = (choice: Choice) => {
    onSelect(choice);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl z-50 overflow-y-auto border-l-4 border-purple-500 animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 text-white p-6 shadow-xl z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2.5 transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2 text-purple-200">
            {question.category}
          </div>
          <h2 className="text-2xl font-bold mb-3 pr-8 leading-tight">{question.question}</h2>
          <p className="text-sm opacity-90 leading-relaxed">{question.explanation}</p>

          {/* Educational tooltip toggle */}
          {Object.keys(educationalTooltips).some(key => 
            question.explanation.toLowerCase().includes(key)
          ) && (
            <button
              onClick={() => setShowEducational(!showEducational)}
              className="mt-4 text-sm flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 transition-all duration-200 font-semibold"
            >
              <span className="text-xl">💡</span>
              {showEducational ? 'Hide' : 'Show'} learning tips
            </button>
          )}
        </div>

        {/* Educational tooltips */}
        {showEducational && (
          <div className="bg-blue-900/50 border-l-4 border-blue-400 p-5 m-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-bold text-blue-100 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">📚</span> Learn: {question.category}
            </h3>
            {Object.entries(educationalTooltips).map(([key, tooltip]) => {
              if (question.explanation.toLowerCase().includes(key)) {
                return (
                  <div key={key} className="mb-4 last:mb-0 bg-blue-900/30 p-4 rounded-lg">
                    <div className="font-bold text-blue-200 mb-1">{tooltip.term}</div>
                    <div className="text-sm text-blue-100 mb-2">{tooltip.simpleExplanation}</div>
                    <div className="text-xs text-blue-300 italic">
                      💡 Example: {tooltip.example}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Choices */}
        <div className="p-5 space-y-4">
          {question.choices.map((choice) => (
            <div
              key={choice.id}
              className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                choice.recommended
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-purple-800/20 shadow-lg shadow-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800/70'
              }`}
            >
              {/* Choice header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedChoice(
                  expandedChoice === choice.id ? null : choice.id
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-2xl">{choice.label.split(' ')[0]}</span>
                      <span className="font-bold text-white text-lg">
                        {choice.label.split(' ').slice(1).join(' ')}
                      </span>
                      {choice.recommended && (
                        <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                          ⭐ RECOMMENDED
                        </span>
                      )}
                      {choice.difficulty && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          choice.difficulty === 'beginner' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : choice.difficulty === 'intermediate'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                            : 'bg-red-500/20 text-red-300 border border-red-500/50'
                        }`}>
                          {choice.difficulty.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{choice.description}</p>
                    {choice.estimatedTime && (
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{choice.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-500 text-xl">
                    {expandedChoice === choice.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedChoice === choice.id && choice.learnMore && (
                <div className="px-5 pb-5 border-t border-gray-700 pt-4 bg-gray-900/50">
                  <div className="text-sm text-gray-300 mb-4 leading-relaxed">{choice.learnMore}</div>
                  {choice.unlocks && choice.unlocks.length > 0 && (
                    <div className="text-xs text-purple-400 mb-3 flex items-start gap-2 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                      <span>🔓</span>
                      <span><strong>Unlocks:</strong> {choice.unlocks.join(', ')}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(choice);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02]"
                  >
                    <span>Choose {choice.label.split(' ').slice(1).join(' ')}</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* Quick select button when not expanded */}
              {expandedChoice !== choice.id && (
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(choice);
                    }}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                      choice.recommended
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    Select
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer tips */}
        <div className="sticky bottom-0 bg-gray-900/95 border-t border-gray-700 p-5 backdrop-blur-sm">
          <div className="text-xs text-gray-400 flex items-start gap-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <span className="text-lg">💡</span>
            <span>
              <strong className="text-gray-300">Tip:</strong> Look for the ⭐ RECOMMENDED badge if you're not sure. 
              We've chosen the easiest and most popular options for beginners.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
