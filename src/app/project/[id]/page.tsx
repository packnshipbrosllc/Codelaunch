// src/app/project/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { EnhancedMindmapFlow } from '@/components/EnhancedMindmapFlow';
import { convertToEnhancedMindmap } from '@/lib/mindmap-converter';
import PRDViewer from '@/components/PRDViewer';
import Header from '@/components/Header';
import AppPreviewModal from '@/components/AppPreviewModal';
import { Eye } from 'lucide-react';
import { Competitor, Feature } from '@/types/mindmap';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mindmap' | 'prd' | 'tech' | 'code' | 'export'>('mindmap');
  const [prdData, setPrdData] = useState<any>(null);
  const [loadingPrd, setLoadingPrd] = useState(false);
  const [techStack, setTechStack] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPRDViewer, setShowPRDViewer] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get project ID from params
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0];

  // Safely resolve fields regardless of schema version
  const projectName = project?.project_name ?? project?.name ?? project?.data?.projectName;
  const idea = project?.idea ?? project?.description ?? project?.data?.projectDescription;
  const mindmapData = project?.mindmap_data ?? project?.data ?? null;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user && projectId) {
      fetchProject();
    }
  }, [user, isLoaded, projectId, router]);

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'F' for fullscreen (only when not typing in input)
      if ((e.key === 'f' || e.key === 'F') && activeTab === 'mindmap') {
        if (!e.target || (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
        }
      }
      
      // Press 'Escape' to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, activeTab]);
  useEffect(() => {
    if (projectId) {
      fetchPRD();
    }
  }, [projectId]);

  const downloadPRD = (data: any) => {
    const content = data?.content?.rawText || JSON.stringify(data?.content, null, 2);
    const name = data?.content?.metadata?.projectName || projectName || 'Project';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-${name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setProject(result.data);
        
        // Update last accessed
        fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ last_accessed_at: new Date().toISOString() }),
        });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPRD = async () => {
    try {
      if (!projectId) return;
      setLoadingPrd(true);
      console.log('📖 [Frontend] Fetching PRD for project:', projectId);
      const response = await fetch(`/api/save-prd?projectId=${projectId}`);
      const result = await response.json();
      console.log('📖 [Frontend] Fetch result:', result);
      console.log('📖 [Frontend] Has data:', !!result?.data);
      console.log('📖 [Frontend] Has content:', !!result?.data?.content);
      console.log('📖 [Frontend] Has rawText:', !!result?.data?.content?.rawText);
      if (result.success && result.data) {
        console.log('✅ [Frontend] PRD loaded successfully');
        setPrdData(result.data);
      } else {
        console.log('ℹ️ [Frontend] No PRD found');
      }
    } catch (error) {
      console.error('❌ [Frontend] Error fetching PRD:', error);
    } finally {
      setLoadingPrd(false);
    }
  };

  const generatePRD = async () => {
    setIsGenerating(true);
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    // Extend frontend timeout slightly beyond backend (90s) to allow response
    timeoutId = setTimeout(() => {
      console.log('⏱️ [Frontend] Aborting due to timeout');
      controller.abort();
    }, 95000);

    try {
      console.log('🚀 [Frontend] Starting PRD generation', {
        projectName,
        hasMindmapData: !!mindmapData,
      });

      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName,
          mindmapData: mindmapData,
        }),
        signal: controller.signal,
        // Improve reliability in Safari
        keepalive: true,
      });

      if (timeoutId) clearTimeout(timeoutId);

      console.log('📡 [Frontend] Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        console.error('❌ [Frontend] Response not OK');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate PRD');
      }

      // Try to read response
      console.log('📄 [Frontend] Reading response body...');
      const result = await response.json();
      console.log('✅ [Frontend] Response parsed:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
      });
      if (result.success) {
        console.log('💾 [Frontend] Saving PRD data...');
        setPrdData(result.data);
        
        console.log('📤 [Frontend] Sending to save-prd API...');
        const saveResponse = await fetch('/api/save-prd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            content: result.data?.content,
            rawText: result.data?.rawText,
            metadata: result.data?.metadata,
          }),
        });
        console.log('💾 [Frontend] Save response:', saveResponse.status);

        console.log('🎉 [Frontend] Showing PRD viewer');
        setShowPRDViewer(true);
      } else {
        throw new Error(result.error || 'Failed to generate PRD');
      }
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('❌ [Frontend] Error caught:', {
        name: error?.name,
        message: error?.message,
        isAbort: error?.name === 'AbortError',
        isOnline: navigator.onLine,
      });

      if (error?.name === 'AbortError') {
        alert('Request timed out. The AI is taking longer than expected. Please try again.');
      } else if (!navigator.onLine) {
        alert('No internet connection. Please check your network and try again.');
      } else {
        alert(`Error: ${error?.message || 'Failed to generate PRD'}`);
        console.error('PRD Generation failed:', error);
      }
    } finally {
      console.log('🏁 [Frontend] Cleaning up...');
      setIsGenerating(false);
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const generateTechStack = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/tech-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName,
          idea: idea,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTechStack(result.data);
      }
    } catch (error) {
      console.error('Error generating tech stack:', error);
      alert('Failed to generate tech stack recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCode = async (codeType: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName,
          idea: idea,
          techStack: techStack,
          codeType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedCode(result.data);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header title="Project Details" showBackButton backUrl="/dashboard" />
      {/* PRD Viewer Modal */}
      {showPRDViewer && prdData && (
        <PRDViewer
          prdData={prdData}
          onClose={() => setShowPRDViewer(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-purple-400 hover:text-purple-300 mb-2 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">{projectName}</h1>
              <p className="text-gray-300 mt-1">{idea}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-gray-800/50 border border-purple-500/20 text-gray-200 rounded-lg font-semibold">
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'mindmap', label: '🗺️ Mindmap', icon: '🗺️' },
              { id: 'prd', label: '📝 PRD', icon: '📝' },
              { id: 'tech', label: '⚙️ Tech Stack', icon: '⚙️' },
              { id: 'code', label: '💻 Code', icon: '💻' },
              { id: 'export', label: '🚀 Export', icon: '🚀' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-300 border-b-2 border-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-40 bg-gray-900' : 'container mx-auto px-4 py-8'}`}>
        {/* Mindmap Tab */}
        {activeTab === 'mindmap' && (
          <div 
            className={`bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden relative transition-all duration-300 ${
              isFullscreen ? 'h-screen rounded-none border-0' : ''
            }`} 
            style={isFullscreen ? { height: '100vh' } : { height: '700px' }}
          >
            {/* Fullscreen Toggle Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="group absolute top-4 right-4 z-50 px-4 py-2.5 
                         bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700
                         text-white rounded-xl shadow-2xl 
                         transition-all duration-300 
                         flex items-center gap-2 font-semibold text-sm
                         hover:scale-105 hover:shadow-purple-500/50"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F)"}
            >
              {isFullscreen ? (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-180" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                  <span>Fullscreen</span>
                </>
              )}
            </button>

            {mindmapData ? (
              <div className="w-full h-full" style={{ width: '100%', height: '100%' }}>
                <EnhancedMindmapFlow data={convertToEnhancedMindmap({
                projectName: mindmapData.projectName,
                projectDescription: mindmapData.projectDescription,
                description: mindmapData.projectDescription,
                competitors: mindmapData.competitors.map((c: Competitor) => ({
                  name: c.name,
                  url: c.url,
                  strength: c.strength,
                  ourAdvantage: c.ourAdvantage,
                })),
                techStack: mindmapData.techStack,
                features: mindmapData.features.map((f: Feature) => ({
                  id: f.id,
                  title: f.title,
                  name: f.title,
                  description: f.description,
                  priority: f.priority,
                })),
                monetization: mindmapData.monetization,
                userPersona: mindmapData.userPersona ? {
                  name: mindmapData.userPersona.name,
                  title: mindmapData.userPersona.name,
                  description: mindmapData.userPersona.description,
                  painPoint: mindmapData.userPersona.painPoint,
                  painPoints: [mindmapData.userPersona.painPoint],
                } : undefined,
                targetAudience: mindmapData.targetAudience,
              })} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Mindmap Data</h3>
                  <p className="text-gray-400 mb-4">This project doesn't have a mindmap yet.</p>
                  <button
                    onClick={() => router.push(`/create?projectId=${projectId}`)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all"
                  >
                    Generate Mindmap →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRD Tab */}
        {activeTab === 'prd' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Product Requirements Document
              </h2>
              <p className="text-gray-300 mb-8">
                Generate a comprehensive PRD that includes user stories, technical requirements,
                success metrics, and implementation roadmap.
              </p>
              
              <button
                onClick={generatePRD}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? '🤖 Generating PRD...' : '✨ Generate PRD'}
              </button>

              {prdData && !showPRDViewer && (
                <button
                  onClick={() => setShowPRDViewer(true)}
                  className="ml-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-all"
                >
                  👁️ View PRD
                </button>
              )}
            </div>

            {/* Enhanced Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-12">
              {/* Generate PRD Card */}
              <div className="group bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Generate PRD</h3>
                  <p className="text-purple-100 text-sm mb-4">Create a comprehensive product requirements document</p>
                  <button
                    onClick={generatePRD}
                    disabled={isGenerating || !mindmapData}
                    className="w-full bg-white text-purple-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      'Generate PRD'
                    )}
                  </button>
                  {prdData && (
                    <button
                      onClick={() => setShowPRDViewer(true)}
                      className="w-full mt-2 bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      View PRD
                    </button>
                  )}
                </div>
              </div>

              {/* Tech Stack Card */}
              <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Tech Stack</h3>
                  <p className="text-blue-100 text-sm mb-4">Get AI-powered technology recommendations</p>
                  <button
                    onClick={generateTechStack}
                    disabled={isGenerating || !prdData}
                    className="w-full bg-white text-blue-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      'Get Recommendations'
                    )}
                  </button>
                </div>
              </div>

              {/* Generate Code Card */}
              <div className="group bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <span className="text-xl">💻</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Generate Code</h3>
                  <p className="text-emerald-100 text-sm mb-4">Transform your PRD into working code</p>
                  <button
                    onClick={() => generateCode('fullstack')}
                    disabled={isGenerating || !techStack}
                    className="w-full bg-white text-emerald-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        Coding...
                      </span>
                    ) : (
                      'Generate Code'
                    )}
                  </button>
                  {generatedCode && (
                    <button
                      onClick={() => setShowCodePreview(true)}
                      className="w-full mt-2 bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Code
                    </button>
                  )}
                </div>
              </div>

              {/* Export Card */}
              <div className="group bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <span className="text-xl">📦</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Export Project</h3>
                  <p className="text-orange-100 text-sm mb-4">Export to Lovable, Cursor, Bolt, or Replit</p>
                  <button
                    disabled={!generatedCode}
                    className="w-full bg-white text-orange-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Options
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-lg p-8 mb-8 border">
              <h2 className="text-2xl font-bold text-white mb-6">Project Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mindmapData ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {mindmapData ? (
                      <span className="text-white text-xl">✓</span>
                    ) : (
                      <span className="text-white font-bold">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Mindmap Created</h3>
                    <p className="text-sm text-gray-300">Project structure defined</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prdData ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {prdData ? (
                      <span className="text-white text-xl">✓</span>
                    ) : (
                      <span className="text-white font-bold">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">PRD Generated</h3>
                    <p className="text-sm text-gray-300">Requirements documented</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${techStack ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {techStack ? (
                      <span className="text-white text-xl">✓</span>
                    ) : (
                      <span className="text-white font-bold">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Tech Stack Ready</h3>
                    <p className="text-sm text-gray-300">Technologies selected</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${generatedCode ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {generatedCode ? (
                      <span className="text-white text-xl">✓</span>
                    ) : (
                      <span className="text-white font-bold">4</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Code Generated</h3>
                    <p className="text-sm text-gray-300">Ready to export</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Product Requirements Document
              </h2>
              <p className="text-gray-300 mb-8">
                Generate a comprehensive PRD that includes user stories, technical requirements,
                success metrics, and implementation roadmap.
              </p>
              
              <button
                onClick={generatePRD}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? '🤖 Generating PRD...' : '✨ Generate PRD'}
              </button>

              {prdData && !showPRDViewer && (
                <button
                  onClick={() => setShowPRDViewer(true)}
                  className="ml-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-all"
                >
                  👁️ View PRD
                </button>
              )}
            </div>
            <div className="mt-8">
              {loadingPrd && (
                <div className="text-center py-8">
                  <p className="text-gray-300">Loading PRD...</p>
                </div>
              )}
              {!loadingPrd && prdData && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-white">Product Requirements Document</h2>
                  {(() => {
                    let contentObj: any = null;
                    try {
                      contentObj = typeof prdData.content === 'string'
                        ? JSON.parse(prdData.content)
                        : prdData.content;
                    } catch (e) {
                      console.error('Error parsing content:', e);
                      return <p className="text-red-400">Error loading PRD content</p>;
                    }

                    const rawText = contentObj?.rawText || '';
                    if (!rawText) {
                      return <p className="text-gray-300">No content available</p>;
                    }

                    return (
                      <>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200 bg-gray-900 p-4 rounded leading-relaxed">
                            {rawText}
                          </pre>
                        </div>
                        {contentObj?.metadata && (
                          <div className="mt-4 pt-4 border-t text-sm text-gray-300">
                            <p><strong>Project:</strong> {contentObj.metadata.projectName}</p>
                            <p><strong>Generated:</strong> {new Date(contentObj.metadata.generatedAt).toLocaleString()}</p>
                            <p><strong>Model:</strong> {contentObj.metadata.model}</p>
                            {contentObj.metadata.tokensUsed && (
                              <p><strong>Tokens:</strong> {contentObj.metadata.tokensUsed.input_tokens + contentObj.metadata.tokensUsed.output_tokens}</p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const projectNameDl = contentObj.metadata?.projectName || 'document';
                            const date = new Date().toISOString().split('T')[0];
                            const blob = new Blob([rawText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `PRD-${projectNameDl}-${date}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          📥 Download PRD
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
              {!loadingPrd && !prdData && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-8 text-center mt-6">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-300 mb-4">No PRD has been generated for this project yet.</p>
                  <button 
                    onClick={generatePRD}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate PRD Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack Tab */}
        {activeTab === 'tech' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-8">
            {!techStack ? (
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-4">⚙️</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Tech Stack Recommendations
                </h2>
                <p className="text-gray-300 mb-8">
                  Get AI-powered recommendations for the best technologies, frameworks,
                  and tools for your project.
                </p>
                
                <button
                  onClick={generateTechStack}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? '🤖 Generating...' : '✨ Generate Tech Stack'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Recommended Tech Stack</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frontend */}
                  <div className="border rounded-xl p-6 bg-gray-800/50 border-purple-500/20">
                    <h3 className="text-lg font-bold text-purple-300 mb-3">🎨 Frontend</h3>
                    <div className="space-y-2 text-gray-200">
                      <div><strong>Framework:</strong> {techStack.frontend?.framework}</div>
                      <div><strong>Styling:</strong> {techStack.frontend?.styling}</div>
                      <div className="text-sm text-gray-400">{techStack.frontend?.reasoning}</div>
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="border rounded-xl p-6 bg-gray-800/50 border-purple-500/20">
                    <h3 className="text-lg font-bold text-blue-300 mb-3">⚡ Backend</h3>
                    <div className="space-y-2 text-gray-200">
                      <div><strong>Language:</strong> {techStack.backend?.language}</div>
                      <div><strong>Framework:</strong> {techStack.backend?.framework}</div>
                      <div className="text-sm text-gray-400">{techStack.backend?.reasoning}</div>
                    </div>
                  </div>

                  {/* Database */}
                  <div className="border rounded-xl p-6 bg-gray-800/50 border-purple-500/20">
                    <h3 className="text-lg font-bold text-green-300 mb-3">💾 Database</h3>
                    <div className="space-y-2 text-gray-200">
                      <div><strong>Primary:</strong> {techStack.database?.primary}</div>
                      <div><strong>Caching:</strong> {techStack.database?.caching}</div>
                      <div className="text-sm text-gray-400">{techStack.database?.reasoning}</div>
                    </div>
                  </div>

                  {/* Hosting */}
                  <div className="border rounded-xl p-6 bg-gray-800/50 border-purple-500/20">
                    <h3 className="text-lg font-bold text-orange-300 mb-3">🌐 Hosting</h3>
                    <div className="space-y-2 text-gray-200">
                      <div><strong>Platform:</strong> {techStack.hosting?.platform}</div>
                      <div className="text-sm text-gray-400">{techStack.hosting?.reasoning}</div>
                    </div>
                  </div>
                </div>

                {/* Estimates */}
                {techStack.estimatedComplexity && (
                  <div className="mt-6 p-6 bg-gray-800/50 border border-purple-500/20 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">📊 Estimates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-200">
                      <div>
                        <div className="text-sm text-gray-400">Complexity</div>
                        <div className="font-semibold">{techStack.estimatedComplexity}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Timeline</div>
                        <div className="font-semibold">{techStack.estimatedTimeline}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Team Size</div>
                        <div className="font-semibold">{techStack.teamSize}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">💻 Generate Code</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { type: 'component', label: 'React Component', icon: '⚛️', desc: 'Generate UI components' },
                { type: 'api', label: 'API Endpoints', icon: '🔌', desc: 'Generate backend APIs' },
                { type: 'database', label: 'Database Schema', icon: '💾', desc: 'Generate DB models' },
                { type: 'fullstack', label: 'Full Stack', icon: '🚀', desc: 'Complete boilerplate' },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => generateCode(option.type)}
                  disabled={isGenerating}
                  className="p-6 border-2 border-purple-500/20 rounded-xl hover:border-purple-500 hover:bg-gray-800 transition-all text-left disabled:opacity-50 text-gray-200"
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-bold text-white mb-1">{option.label}</div>
                  <div className="text-sm text-gray-300">{option.desc}</div>
                </button>
              ))}
            </div>

            {generatedCode && (
              <div className="text-gray-200">
                <h3 className="text-xl font-bold mb-4">Generated Code:</h3>
                <div className="space-y-4">
                  {generatedCode.files?.map((file: any, idx: number) => (
                    <div key={idx} className="border border-purple-500/20 rounded-xl overflow-hidden">
                      <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
                        <span className="font-mono text-sm">{file.path}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.content);
                            alert('Copied to clipboard!');
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="p-4 bg-gray-950 overflow-x-auto">
                        <code className="text-sm text-gray-200">{file.content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">🚀 Export to Platforms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Lovable', icon: '💖', url: 'https://lovable.dev', desc: 'AI-powered app builder' },
                { name: 'Cursor', icon: '🖱️', url: 'https://cursor.sh', desc: 'AI code editor' },
                { name: 'Bolt', icon: '⚡', url: 'https://bolt.new', desc: 'Instant deployment' },
                { name: 'v0', icon: '🎨', url: 'https://v0.dev', desc: 'Vercel AI design' },
                { name: 'GitHub', icon: '🐙', url: 'https://github.com', desc: 'Version control' },
                { name: 'Replit', icon: '🔄', url: 'https://replit.com', desc: 'Online IDE' },
              ].map((platform) => (
                <div key={platform.name} className="border-2 border-purple-500/20 rounded-xl p-6 hover:border-purple-500 hover:bg-gray-800 transition-all">
                  <div className="text-4xl mb-3">{platform.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{platform.name}</h3>
                  <p className="text-sm text-gray-300 mb-4">{platform.desc}</p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                  >
                    Open {platform.name} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCodePreview && generatedCode && (
        <AppPreviewModal
          code={JSON.stringify(generatedCode, null, 2)}
          projectName={projectName}
          onClose={() => setShowCodePreview(false)}
        />
      )}
    </div>
  );
}
