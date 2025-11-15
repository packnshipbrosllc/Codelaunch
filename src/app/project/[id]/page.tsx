'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { EnhancedMindmapFlow } from '@/components/EnhancedMindmapFlow';
import { convertToEnhancedMindmap } from '@/lib/mindmap-converter';
import AIAssistantChatEnhanced from '@/components/AIAssistantChatEnhanced';
import FloatingMoodBoard from '@/components/FloatingMoodBoard';
import Header from '@/components/Header';
import { SpaceBackground } from '@/components/ui/space-background';
import { useMindmapLimit } from '@/hooks/useMindmapLimit';
import { Loader2 } from 'lucide-react';
import { Competitor, Feature } from '@/types/mindmap';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSubscribed } = useMindmapLimit();
  
  const projectId = typeof params.id === 'string' ? params.id : params.id?.[0];
  
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAIChat, setShowAIChat] = useState(true);
  const [moodBoardImages, setMoodBoardImages] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    loadProject();
  }, [isLoaded, user, projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load project');
      }

      const project = result.data;
      
      // Safely resolve fields regardless of schema version
      const projectName = project?.project_name ?? project?.name ?? project?.data?.projectName;
      const idea = project?.idea ?? project?.description ?? project?.data?.projectDescription;
      const mindmapData = project?.mindmap_data ?? project?.data ?? null;

      if (!mindmapData) {
        throw new Error('No mindmap data found for this project');
      }

      setProjectData({
        projectName,
        projectDescription: idea,
        ...mindmapData,
      });
    } catch (err: any) {
      console.error('Error loading project:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Project is already saved, this is just for updates
    alert('Project saved successfully!');
  };

  const handleGeneratePRD = async (nodeId: string, featureData: any) => {
    if (!isSubscribed) {
      const upgrade = window.confirm(
        '🔒 PRD Generation is a Pro Feature\n\n' +
        'Generate comprehensive PRDs with:\n' +
        '• Technical specifications\n' +
        '• API documentation\n' +
        '• Data schemas\n' +
        '• Edge cases\n' +
        '• User stories\n\n' +
        'Upgrade to Pro?'
      );
      if (upgrade) window.location.href = '/#pricing';
      return;
    }

    try {
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: featureData,
          projectContext: {
            projectName: projectData.projectName,
            projectDescription: projectData.projectDescription,
            techStack: projectData.techStack,
            allFeatures: projectData.features,
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ PRD Generated!');
        
        // Update local state
        setProjectData({
          ...projectData,
          features: projectData.features.map((f: any) =>
            f.id === nodeId ? { ...f, prd: result.prd, hasPRD: true } : f
          )
        });
      }
    } catch (error: any) {
      alert('Failed: ' + error.message);
    }
  };

  const enhancedMindmapData = useMemo(() => {
    if (!projectData) return null;
    
    return convertToEnhancedMindmap({
      projectName: projectData.projectName,
      projectDescription: projectData.projectDescription,
      description: projectData.projectDescription,
      competitors: (projectData.competitors || []).map((c: Competitor) => ({
        name: c.name,
        url: c.url,
        strength: c.strength,
        ourAdvantage: c.ourAdvantage,
      })),
      techStack: projectData.techStack || {},
      features: (projectData.features || []).map((f: Feature) => ({
        id: f.id,
        title: f.title,
        name: f.title,
        description: f.description,
        priority: f.priority,
      })),
      monetization: projectData.monetization || {},
      userPersona: projectData.userPersona ? {
        name: projectData.userPersona.name,
        title: projectData.userPersona.name,
        description: projectData.userPersona.description,
        painPoint: projectData.userPersona.painPoint,
        painPoints: [projectData.userPersona.painPoint],
      } : undefined,
      targetAudience: projectData.targetAudience || '',
    });
  }, [projectData]);

  if (!isLoaded || isLoading) {
    return (
      <SpaceBackground variant="default">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Loading project...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  if (error || !projectData) {
    return (
      <SpaceBackground variant="default">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">Error: {error || 'Project not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  return (
    <SpaceBackground variant="default">
      <div className="min-h-screen relative">
        <Header 
          title={projectData.projectName} 
          showBackButton 
          backUrl="/dashboard" 
        />
        
        {/* Action Buttons - Fixed Position */}
        <div className="fixed top-24 right-8 z-50 flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-2xl backdrop-blur-xl border border-green-400/30 transition-all hover:scale-105"
          >
            💾 Save Changes
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold shadow-2xl transition-all"
          >
            {isFullscreen ? '⬅️ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>

        {/* Mindmap Container */}
        <div className="container mx-auto px-4 py-8">
          <div className={`relative ${isFullscreen ? 'fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm' : ''}`}>
            
            {/* Main Mindmap */}
            <div className="w-full rounded-2xl overflow-hidden" style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 200px)' }}>
              {enhancedMindmapData && (
                <EnhancedMindmapFlow 
                  key={`mindmap-${projectData.projectName}`}
                  data={enhancedMindmapData} 
                  onSave={handleSave}
                  onNodeClick={(feature) => setSelectedFeature(feature)}
                  onGeneratePRD={handleGeneratePRD}
                  isSubscribed={isSubscribed}
                />
              )}
            </div>

            {/* Floating Mood Board */}
            {!isFullscreen && (
              <FloatingMoodBoard 
                images={moodBoardImages}
                onImagesChange={setMoodBoardImages}
              />
            )}

            {/* AI Assistant Chat */}
            {showAIChat && enhancedMindmapData && (
              <AIAssistantChatEnhanced
                mindmapData={enhancedMindmapData}
                moodBoardImages={moodBoardImages}
                isCollapsed={!showAIChat}
                onToggleCollapse={() => setShowAIChat(!showAIChat)}
              />
            )}
          </div>
        </div>
      </div>
    </SpaceBackground>
  );
}
