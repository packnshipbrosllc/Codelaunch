import React from 'react';
import { ArrowRight, CheckCircle, Star, Zap, Shield, Users } from 'lucide-react';
import { AppData } from '@/types';

interface TemplateStageProps {
  appData: AppData;
  onContinue: () => void;
}

export default function TemplateStage({ appData, onContinue }: TemplateStageProps) {
  const templates = [
    {
      id: 'ShipFast',
      name: 'ShipFast',
      description: 'Complete SaaS boilerplate with authentication, payments, and dashboard',
      features: ['Next.js 14', 'Tailwind CSS', 'Stripe Integration', 'NextAuth.js', 'Prisma ORM'],
      recommended: appData.template === 'ShipFast',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'Gravity',
      name: 'Gravity',
      description: 'AI-powered application template with modern UI components',
      features: ['AI Integration', 'Modern UI', 'Real-time Features', 'Advanced Analytics'],
      recommended: appData.template === 'Gravity',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'React Native Starter',
      name: 'React Native Starter',
      description: 'Mobile-first template with cross-platform compatibility',
      features: ['React Native', 'Expo', 'Firebase', 'Push Notifications'],
      recommended: appData.template === 'React Native Starter',
      icon: '📱',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Template
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the perfect template for {appData.name}. We've recommended the best option based on your requirements.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all transform hover:scale-105 cursor-pointer ${
                template.recommended ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {template.recommended && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Recommended
                </div>
              )}
              
              <div className={`w-16 h-16 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {template.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{template.description}</p>
              
              <div className="space-y-2">
                {template.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Selected Template: {appData.template}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Key Features
              </h4>
              <div className="space-y-2">
                {appData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Tech Stack
              </h4>
              <div className="space-y-2">
                {appData.techStack.map((tech, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Why This Template?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">User-Focused</h4>
              <p className="text-gray-300 text-sm">Designed with user experience as the top priority</p>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Fast Development</h4>
              <p className="text-gray-300 text-sm">Get to market quickly with pre-built components</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Production Ready</h4>
              <p className="text-gray-300 text-sm">Battle-tested code ready for scale</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Configure Your App
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
