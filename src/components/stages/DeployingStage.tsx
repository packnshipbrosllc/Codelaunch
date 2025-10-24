import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, CheckCircle, Terminal, Globe } from 'lucide-react';

interface DeployingStageProps {
  onComplete: () => void;
}

export default function DeployingStage({ onComplete }: DeployingStageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    { name: 'Building application', log: 'npm run build' },
    { name: 'Optimizing assets', log: 'Optimizing images and static assets...' },
    { name: 'Creating deployment package', log: 'Packaging application for deployment...' },
    { name: 'Uploading to Vercel', log: 'Uploading files to Vercel...' },
    { name: 'Configuring environment', log: 'Setting up environment variables...' },
    { name: 'Deploying to production', log: 'Deploying to production servers...' },
    { name: 'Running health checks', log: 'Running health checks and tests...' },
    { name: 'Deployment complete', log: '✅ Deployment successful!' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 2000);
          return 100;
        }
        
        const newProgress = prev + 12.5; // 100 / 8 steps
        const stepIndex = Math.floor(newProgress / 12.5);
        
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex].name);
          setLogs(prev => [...prev, steps[stepIndex].log]);
        }
        
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Upload className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Deploying Your App
          </h1>
          <p className="text-xl text-gray-300">
            Your application is being deployed to production...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-semibold">Deployment Progress</span>
            <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Current Step
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-gray-300">{currentStep}</span>
            </div>
          </div>
        )}

        {/* Deployment Logs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            Deployment Logs
          </h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="text-gray-300 mb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">Waiting for deployment to start...</div>
            )}
          </div>
        </div>

        {/* Deployment Steps */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Deployment Steps</h3>
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isCompleted = idx < Math.floor(progress / 12.5);
              const isCurrent = idx === Math.floor(progress / 12.5);
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : isCurrent
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isCurrent
                      ? 'bg-blue-500'
                      : 'bg-white/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-white/40 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">Vercel</div>
            <div className="text-gray-300 text-sm">Deployment Platform</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">~2min</div>
            <div className="text-gray-300 text-sm">Deployment Time</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400 mb-2">Global</div>
            <div className="text-gray-300 text-sm">CDN Distribution</div>
          </div>
        </div>
      </div>
    </div>
  );
}
