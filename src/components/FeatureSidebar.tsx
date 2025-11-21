// Feature Sidebar Component with Space Theme
// Location: src/components/FeatureSidebar.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Sparkles, FileText, Code, Database, Zap, Users, CheckCircle2, Clock, Download, Check } from 'lucide-react';
import { SpaceBackground } from '@/components/ui/space-background';
import { EnhancedFeature } from '@/types/enhanced-mindmap';
import PRDPreview from '@/components/PRDPreview';
import ExportModal from '@/components/ExportModal';
import ReactMarkdown from 'react-markdown';

interface FeatureSidebarProps {
  feature: EnhancedFeature | null;
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onGeneratePRD: (featureId: string, featureData: any) => void;
  onShowPRDPreview: (feature: EnhancedFeature) => void;
}

export default function FeatureSidebar({
  feature,
  isOpen,
  onClose,
  isSubscribed,
  onGeneratePRD,
  onShowPRDPreview,
}: FeatureSidebarProps) {
  const [showPRDPreview, setShowPRDPreview] = useState(false);
  const [prdContent, setPrdContent] = useState<string | null>(null);
  const [codeContent, setCodeContent] = useState<any>(null);
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!feature || !isOpen) return null;

  const handlePRDClick = async () => {
    if (!isSubscribed) {
      // Show preview for free users
      setShowPRDPreview(true);
      return;
    }

    // Generate actual PRD for Pro users
    setIsGeneratingPRD(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-feature-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: feature.id,
          featureName: feature.title,
          featureDescription: feature.description,
          projectContext: {
            projectName: 'Your Project',
            techStack: 'React/Next.js, Node.js, PostgreSQL',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Convert PRD object to markdown string for display
        const prdMarkdown = typeof data.prd === 'string' 
          ? data.prd 
          : JSON.stringify(data.prd, null, 2);
        setPrdContent(prdMarkdown);
      } else {
        setError(data.error || 'Failed to generate PRD');
      }
    } catch (error: any) {
      console.error('Failed to generate PRD:', error);
      setError(error.message || 'Failed to generate PRD. Please try again.');
    } finally {
      setIsGeneratingPRD(false);
    }
  };

  const handleCodeGeneration = async () => {
    if (!prdContent) return;

    setIsGeneratingCode(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prdContent: prdContent,
          techStack: 'React/Next.js, TypeScript, Node.js, PostgreSQL',
          featureName: feature.title,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCodeContent(data.code);
        setShowExportModal(true); // Auto-open export modal when code is ready
      } else {
        setError(data.error || 'Failed to generate code');
      }
    } catch (error: any) {
      console.error('Failed to generate code:', error);
      setError(error.message || 'Failed to generate code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const getPriorityGlow = (priority?: string) => {
    switch (priority) {
      case 'high': return 'shadow-lg shadow-red-500/50';
      case 'medium': return 'shadow-lg shadow-yellow-500/50';
      case 'low': return 'shadow-lg shadow-green-500/50';
      default: return 'shadow-lg shadow-purple-500/50';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high': 
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium': 
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': 
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: 
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-black/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          borderLeft: '4px solid',
          borderImage: 'linear-gradient(to bottom, #a855f7, #ec4899) 1',
        }}
      >
        {/* Space Background with Animated Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
            {/* Animated stars effect - more stars for better effect */}
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
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
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {/* Title with Purple Glow */}
                <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]">
                  {feature.title}
                </h2>
                {/* Priority Badge with Glow */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getPriorityBadge(feature.priority)} ${getPriorityGlow(feature.priority)} uppercase tracking-wide`}>
                    [{feature.priority || 'medium'} Priority]
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-purple-500/20">
            <p className="text-gray-300 leading-relaxed">{feature.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Generate PRD Button with Shimmer Effect */}
            <button
              onClick={handlePRDClick}
              disabled={isGeneratingPRD}
              className={`relative w-full px-6 py-4 rounded-xl border-2 overflow-hidden transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isSubscribed
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50 hover:from-purple-500/40 hover:to-pink-500/40 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                  : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:from-purple-500/30 hover:to-pink-500/30 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  {isGeneratingPRD ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white font-semibold">Generating PRD...</span>
                    </>
                  ) : (
                    <>
                      {!isSubscribed && <Lock className="w-5 h-5 text-yellow-400" />}
                      <Sparkles className="w-5 h-5 text-purple-300" />
                      <span className="text-white font-semibold">
                        {isSubscribed ? 'Generate PRD' : 'Generate PRD (Pro Feature) 🔒'}
                      </span>
                    </>
                  )}
                </div>
                {!isSubscribed && (
                  <div className="flex items-center gap-1 text-purple-300">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs">Preview</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
              </div>
            </button>

            {/* Feature Details */}
            {feature.userStories && feature.userStories.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Stories
                </h3>
                <div className="space-y-2">
                  {feature.userStories.slice(0, 3).map((story, idx) => (
                    <p key={idx} className="text-xs text-gray-400">
                      • {story.persona}: {story.need}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Acceptance Criteria
                </h3>
                <div className="space-y-1">
                  {feature.acceptanceCriteria.slice(0, 3).map((criteria, idx) => (
                    <p key={idx} className="text-xs text-gray-400">✓ {criteria}</p>
                  ))}
                </div>
              </div>
            )}

            {feature.estimatedHours && (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="w-4 h-4" />
                  <span>Estimated: {feature.estimatedHours} hours</span>
                </div>
              </div>
            )}

            {/* Loading State for PRD Generation */}
            {isGeneratingPRD && (
              <div className="mt-4 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-white font-semibold">Generating PRD...</p>
                    <p className="text-gray-400 text-sm">This may take 10-20 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
                <p>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* PRD Content Display */}
            {prdContent && !codeContent && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    Generated PRD
                  </h3>
                  <button
                    onClick={() => setPrdContent(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="prose prose-invert prose-purple max-w-none">
                    <ReactMarkdown>{prdContent}</ReactMarkdown>
                  </div>
                </div>

                {/* Success State */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-300 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    PRD generated successfully! Now generate implementation code.
                  </p>
                </div>

                {/* Generate Code Button */}
                <button
                  onClick={handleCodeGeneration}
                  disabled={isGeneratingCode}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isGeneratingCode ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Code...
                    </>
                  ) : (
                    <>
                      <Code className="w-5 h-5" />
                      Generate Implementation Code
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Code Generation Loading */}
            {isGeneratingCode && (
              <div className="mt-4 p-6 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-white font-semibold">Generating Code...</p>
                    <p className="text-gray-400 text-sm">This may take 20-30 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Code Generated Success State */}
            {codeContent && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-300 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Code generated! Ready to export.
                  </p>
                </div>

                {/* Export Button */}
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRD Preview Modal */}
      <PRDPreview
        feature={feature}
        isOpen={showPRDPreview}
        onClose={() => setShowPRDPreview(false)}
        onUpgrade={() => {
          setShowPRDPreview(false);
          window.location.href = '/#pricing';
        }}
      />

      {/* Export Modal */}
      {showExportModal && codeContent && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          isSubscribed={isSubscribed}
          projectName={feature.title}
          projectData={codeContent}
          codeContent={codeContent}
          featureName={feature.title}
        />
      )}
    </>
  );
}

