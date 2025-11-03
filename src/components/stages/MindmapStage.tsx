import React, { useMemo } from 'react';
import { ArrowRight, Users, Zap, Database } from 'lucide-react';
import { AppData } from '@/types';
import MindmapFlow from '@/components/MindmapFlow';
import { MindmapData } from '@/types/mindmap';

interface MindmapStageProps {
  appData: AppData;
  onContinue: () => void;
}

export default function MindmapStage({ appData, onContinue }: MindmapStageProps) {
  // Convert AppData to MindmapData format for React Flow
  const mindmapData: MindmapData = useMemo(() => {
    // Extract tech stack components from array
    const techStackArray = appData.techStack || [];
    const database = techStackArray.find(t => t.toLowerCase().includes('postgres') || t.toLowerCase().includes('mongodb') || t.toLowerCase().includes('sql')) || techStackArray[0] || 'PostgreSQL';
    const frontend = techStackArray.find(t => t.toLowerCase().includes('react') || t.toLowerCase().includes('next') || t.toLowerCase().includes('vue')) || techStackArray[1] || 'React';
    const backend = techStackArray.find(t => t.toLowerCase().includes('node') || t.toLowerCase().includes('express') || t.toLowerCase().includes('api')) || techStackArray[2] || 'Node.js';
    
    return {
      projectName: appData.name,
      projectDescription: appData.description,
      targetAudience: appData.platform === 'web' ? 'Web users' : 'Mobile users',
      competitors: [
        {
          name: 'Competitor 1',
          strength: 'Established market presence',
          ourAdvantage: 'Modern tech stack and better UX'
        },
        {
          name: 'Competitor 2',
          strength: 'Large user base',
          ourAdvantage: 'More affordable pricing'
        },
        {
          name: 'Competitor 3',
          strength: 'Feature-rich platform',
          ourAdvantage: 'Simpler, more intuitive interface'
        }
      ],
      techStack: {
        frontend: frontend,
        backend: backend,
        database: database,
        auth: 'Clerk',
        payments: 'Stripe',
        hosting: 'Vercel'
      },
      features: appData.features.map((feature, index) => ({
        id: `feature-${index}`,
        title: feature,
        description: `Core functionality: ${feature}`,
        priority: index < 3 ? 'high' as const : index < 6 ? 'medium' as const : 'low' as const
      })),
      monetization: {
        model: 'subscription' as const,
        pricing: '$39.99/month',
        freeTier: '3 free mindmaps',
        paidTier: 'Unlimited features'
      },
      userPersona: {
        name: `${appData.platform === 'web' ? 'Web' : 'Mobile'} Entrepreneurs`,
        description: `Builders creating ${appData.platform === 'web' ? 'web' : 'mobile'} applications`,
        painPoint: 'Slow development process and complex setup',
        goal: 'Ship products faster with AI-powered tools'
      }
    };
  }, [appData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your App Architecture
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Here's how your {appData.name} will be structured. Explore the interactive mindmap below.
          </p>
        </div>

        {/* React Flow Mindmap */}
        <div className="mb-8">
          <MindmapFlow data={mindmapData} />
        </div>

        {/* App Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Platform</h3>
            <p className="text-gray-300 capitalize">{appData.platform}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Zap className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Template</h3>
            <p className="text-gray-300">{appData.template}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <Database className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Tech Stack</h3>
            <p className="text-gray-300">{appData.techStack.join(', ')}</p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Continue to PRD
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
