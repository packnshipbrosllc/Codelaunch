// components/ChoicePanel.tsx
'use client';

import { useState } from 'react';
import { X, ChevronRight, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { DecisionNode, Choice } from '@/types/decision-tree';

interface ChoicePanelProps {
  question: DecisionNode;
  onSelect: (choice: Choice) => void;
  onClose: () => void;
}

export default function ChoicePanel({ question, onSelect, onClose }: ChoicePanelProps) {
  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col" style={{ animation: 'slideInRight 0.3s ease-out' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-90">
              {question.category}
            </div>
            <h2 className="text-xl font-bold">{question.question}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Explanation */}
        <p className="text-sm text-white/90 mt-2">{question.explanation}</p>
      </div>

      {/* Choices */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {question.choices.map((choice) => {
          const isExpanded = expandedChoice === choice.id;
          
          return (
            <div
              key={choice.id}
              className={`
                border-2 rounded-xl p-4 transition-all cursor-pointer
                ${choice.recommended
                  ? 'border-purple-400 bg-purple-50 hover:bg-purple-100'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }
              `}
              onClick={() => {
                if (isExpanded) {
                  onSelect(choice);
                } else {
                  setExpandedChoice(choice.id);
                }
              }}
            >
              {/* Choice header */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{choice.label}</h3>
                    {choice.recommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">
                        <Sparkles className="w-3 h-3" />
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{choice.description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {choice.difficulty && (
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-medium
                        ${choice.difficulty === 'beginner' 
                          ? 'bg-green-100 text-green-700'
                          : choice.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }
                      `}>
                        {choice.difficulty}
                      </span>
                    )}
                    {choice.estimatedTime && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        <Clock className="w-3 h-3" />
                        {choice.estimatedTime}
                      </span>
                    )}
                  </div>

                  {/* Learn more button */}
                  {choice.learnMore && !isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedChoice(choice.id);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                    >
                      Learn more <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && choice.learnMore && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Why this matters</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{choice.learnMore}</p>
                  
                  {/* Select button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(choice);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
                  >
                    Select This Option
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-sm text-gray-600">
        Click any option to learn more, or select it directly
      </div>
    </div>
  );
}

