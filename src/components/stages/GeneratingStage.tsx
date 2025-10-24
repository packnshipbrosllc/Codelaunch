import React, { useState, useEffect } from 'react';
import { ArrowRight, Code, CheckCircle, FileText, Zap } from 'lucide-react';

interface GeneratingStageProps {
  onComplete: () => void;
}

export default function GeneratingStage({ onComplete }: GeneratingStageProps) {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);

  const files = [
    'package.json',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/components/ui/Button.tsx',
    'src/components/ui/Input.tsx',
    'src/lib/auth.ts',
    'src/lib/database.ts',
    'src/lib/utils.ts',
    'src/types/index.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/api/users/route.ts',
    'src/app/dashboard/page.tsx',
    'src/app/admin/page.tsx',
    'tailwind.config.js',
    'next.config.js',
    'README.md'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 100;
        }
        
        const newProgress = prev + 6.25; // 100 / 16 files
        const fileIndex = Math.floor(newProgress / 6.25);
        
        if (fileIndex < files.length) {
          setCurrentFile(files[fileIndex]);
          if (fileIndex > 0) {
            setCompletedFiles(prev => [...prev, files[fileIndex - 1]]);
          }
        }
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Code className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Generating Your App
          </h1>
          <p className="text-xl text-gray-300">
            Creating all the files and components for your application...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-semibold">Generation Progress</span>
            <span className="text-green-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current File */}
        {currentFile && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Currently Generating
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-gray-300 font-mono">{currentFile}</span>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Generated Files
          </h3>
          <div className="space-y-3">
            {files.map((file, idx) => {
              const isCompleted = completedFiles.includes(file);
              const isCurrent = currentFile === file;
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : isCurrent
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isCurrent
                      ? 'bg-yellow-500'
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
                  <span className={`font-mono text-sm ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    {file}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400 mb-2">{files.length}</div>
            <div className="text-gray-300 text-sm">Files Generated</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">{completedFiles.length}</div>
            <div className="text-gray-300 text-sm">Completed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400 mb-2">~30s</div>
            <div className="text-gray-300 text-sm">Estimated Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
