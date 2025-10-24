import React from 'react';
import { ArrowRight, FileText, CheckCircle, Users, Zap, Shield } from 'lucide-react';
import { AppData } from '@/types';

interface PRDStageProps {
  appData: AppData;
  onContinue: () => void;
}

export default function PRDStage({ appData, onContinue }: PRDStageProps) {
  const requirements = [
    {
      category: 'Core Features',
      items: appData.features.map(feature => ({
        title: feature,
        description: `Implement ${feature.toLowerCase()} functionality`,
        priority: 'High'
      }))
    },
    {
      category: 'Technical Requirements',
      items: [
        {
          title: 'Responsive Design',
          description: 'Ensure optimal experience across all devices',
          priority: 'High'
        },
        {
          title: 'Authentication System',
          description: 'Secure user login and registration',
          priority: 'High'
        },
        {
          title: 'Database Integration',
          description: 'Robust data storage and retrieval',
          priority: 'High'
        },
        {
          title: 'API Development',
          description: 'RESTful API for frontend communication',
          priority: 'Medium'
        }
      ]
    },
    {
      category: 'User Experience',
      items: [
        {
          title: 'Intuitive Interface',
          description: 'Clean and user-friendly design',
          priority: 'High'
        },
        {
          title: 'Performance Optimization',
          description: 'Fast loading times and smooth interactions',
          priority: 'Medium'
        },
        {
          title: 'Accessibility',
          description: 'WCAG 2.1 compliance for all users',
          priority: 'Medium'
        }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <FileText className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Product Requirements Document
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Detailed specifications for {appData.name} based on your requirements
          </p>
        </div>

        {/* App Overview */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Project Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <p className="text-gray-300 leading-relaxed">{appData.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Technical Stack</h3>
              <div className="space-y-2">
                {appData.techStack.map((tech, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Sections */}
        <div className="space-y-8 mb-8">
          {requirements.map((section, sectionIdx) => (
            <div key={sectionIdx} className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                {sectionIdx === 0 && <Users className="w-6 h-6 text-blue-400" />}
                {sectionIdx === 1 && <Zap className="w-6 h-6 text-purple-400" />}
                {sectionIdx === 2 && <Shield className="w-6 h-6 text-green-400" />}
                {section.category}
              </h3>
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Success Metrics */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Success Metrics</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-gray-300">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">&lt;2s</div>
              <div className="text-gray-300">Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Continue to Template Selection
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
