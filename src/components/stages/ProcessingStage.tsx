import React from 'react';
import { Brain, Zap, CheckCircle } from 'lucide-react';

interface ProcessingStageProps {
  progress: number;
}

export default function ProcessingStage({ progress }: ProcessingStageProps) {
  const steps = [
    { id: 1, name: 'Analyzing your idea', completed: progress > 20 },
    { id: 2, name: 'Generating architecture', completed: progress > 40 },
    { id: 3, name: 'Creating mindmap', completed: progress > 60 },
    { id: 4, name: 'Building requirements', completed: progress > 80 },
    { id: 5, name: 'Finalizing details', completed: progress >= 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            AI is Processing Your Idea
          </h1>
          <p className="text-xl text-gray-300">
            Our AI is analyzing your requirements and generating the perfect solution...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-semibold">Progress</span>
            <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                step.completed 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500' 
                  : 'bg-white/10'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  step.completed ? 'text-green-400' : 'text-white'
                }`}>
                  {step.name}
                </p>
              </div>
              {step.completed && (
                <Zap className="w-5 h-5 text-green-400" />
              )}
            </div>
          ))}
        </div>

        {/* Fun Facts */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <p className="text-gray-300 text-sm">
              💡 <strong>Did you know?</strong> Our AI has analyzed over 10,000+ successful apps to generate the perfect architecture for your idea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
