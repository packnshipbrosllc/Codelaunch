// src/app/project/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MindmapFlow from '@/components/MindmapFlow';
import PRDViewer from '@/components/PRDViewer';
import Header from '@/components/Header';

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
      console.log('📖 Fetching PRD for project:', projectId);
      const response = await fetch(`/api/save-prd?projectId=${projectId}`);
      const result = await response.json();
      if (result.success && result.data) {
        console.log('✅ PRD loaded successfully');
        setPrdData(result.data);
      } else {
        console.log('ℹ️ No PRD found yet');
      }
    } catch (error) {
      console.error('❌ Error fetching PRD:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header title="Project Details" showBackButton backUrl="/dashboard" />
      {/* PRD Viewer Modal */}
      {showPRDViewer && prdData && (
        <PRDViewer
          prdData={prdData}
          projectName={projectName}
          onClose={() => setShowPRDViewer(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-purple-600 hover:text-purple-700 mb-2 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
              <p className="text-gray-600 mt-1">{idea}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
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
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Mindmap Tab */}
        {activeTab === 'mindmap' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '700px' }}>
            <MindmapFlow data={mindmapData} />
          </div>
        )}

        {/* PRD Tab */}
        {activeTab === 'prd' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Product Requirements Document
              </h2>
              <p className="text-gray-600 mb-8">
                Generate a comprehensive PRD that includes user stories, technical requirements,
                success metrics, and implementation roadmap.
              </p>
              
              <button
                onClick={generatePRD}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
              >
                {isGenerating ? '🤖 Generating PRD...' : '✨ Generate PRD'}
              </button>

              {prdData && !showPRDViewer && (
                <button
                  onClick={() => setShowPRDViewer(true)}
                  className="ml-4 px-8 py-4 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition-all"
                >
                  👁️ View PRD
                </button>
              )}
            </div>
            <div className="mt-8">
              {loadingPrd && (
                <p className="text-gray-600 text-center">Loading PRD...</p>
              )}
              {!loadingPrd && prdData && (
                <div className="bg-gray-50 border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Product Requirements Document</h3>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 bg-gray-50 p-4 rounded">
{prdData.content?.rawText || 'No content available'}
                    </pre>
                  </div>
                  {prdData.content?.metadata && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Generated: {new Date(prdData.content.metadata.generatedAt).toLocaleString()}</p>
                      <p>Model: {prdData.content.metadata.model}</p>
                    </div>
                  )}
                  <button
                    onClick={() => downloadPRD(prdData)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download PRD
                  </button>
                </div>
              )}
              {!loadingPrd && !prdData && (
                <p className="text-gray-600 text-center">No PRD generated yet. Click "Generate PRD" to create one.</p>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack Tab */}
        {activeTab === 'tech' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!techStack ? (
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-4">⚙️</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Tech Stack Recommendations
                </h2>
                <p className="text-gray-600 mb-8">
                  Get AI-powered recommendations for the best technologies, frameworks,
                  and tools for your project.
                </p>
                
                <button
                  onClick={generateTechStack}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? '🤖 Generating...' : '✨ Generate Tech Stack'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Tech Stack</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frontend */}
                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-purple-600 mb-3">🎨 Frontend</h3>
                    <div className="space-y-2">
                      <div><strong>Framework:</strong> {techStack.frontend?.framework}</div>
                      <div><strong>Styling:</strong> {techStack.frontend?.styling}</div>
                      <div className="text-sm text-gray-600">{techStack.frontend?.reasoning}</div>
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-3">⚡ Backend</h3>
                    <div className="space-y-2">
                      <div><strong>Language:</strong> {techStack.backend?.language}</div>
                      <div><strong>Framework:</strong> {techStack.backend?.framework}</div>
                      <div className="text-sm text-gray-600">{techStack.backend?.reasoning}</div>
                    </div>
                  </div>

                  {/* Database */}
                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-600 mb-3">💾 Database</h3>
                    <div className="space-y-2">
                      <div><strong>Primary:</strong> {techStack.database?.primary}</div>
                      <div><strong>Caching:</strong> {techStack.database?.caching}</div>
                      <div className="text-sm text-gray-600">{techStack.database?.reasoning}</div>
                    </div>
                  </div>

                  {/* Hosting */}
                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-orange-600 mb-3">🌐 Hosting</h3>
                    <div className="space-y-2">
                      <div><strong>Platform:</strong> {techStack.hosting?.platform}</div>
                      <div className="text-sm text-gray-600">{techStack.hosting?.reasoning}</div>
                    </div>
                  </div>
                </div>

                {/* Estimates */}
                {techStack.estimatedComplexity && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estimates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Complexity</div>
                        <div className="font-semibold">{techStack.estimatedComplexity}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Timeline</div>
                        <div className="font-semibold">{techStack.estimatedTimeline}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Team Size</div>
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
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💻 Generate Code</h2>
            
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
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left disabled:opacity-50"
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>

            {generatedCode && (
              <div>
                <h3 className="text-xl font-bold mb-4">Generated Code:</h3>
                <div className="space-y-4">
                  {generatedCode.files?.map((file: any, idx: number) => (
                    <div key={idx} className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
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
                      <pre className="p-4 bg-gray-50 overflow-x-auto">
                        <code className="text-sm">{file.content}</code>
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
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Export to Platforms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Lovable', icon: '💖', url: 'https://lovable.dev', desc: 'AI-powered app builder' },
                { name: 'Cursor', icon: '🖱️', url: 'https://cursor.sh', desc: 'AI code editor' },
                { name: 'Bolt', icon: '⚡', url: 'https://bolt.new', desc: 'Instant deployment' },
                { name: 'v0', icon: '🎨', url: 'https://v0.dev', desc: 'Vercel AI design' },
                { name: 'GitHub', icon: '🐙', url: 'https://github.com', desc: 'Version control' },
                { name: 'Replit', icon: '🔄', url: 'https://replit.com', desc: 'Online IDE' },
              ].map((platform) => (
                <div key={platform.name} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all">
                  <div className="text-4xl mb-3">{platform.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{platform.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{platform.desc}</p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold"
                  >
                    Open {platform.name} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
