import React from 'react';
import { Rocket, Zap, Shield, Users, ArrowRight } from 'lucide-react';

interface WelcomeStageProps {
  onStart: () => void;
}

export default function WelcomeStage({ onStart }: WelcomeStageProps) {
  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Generation',
      description: 'Transform your idea into a fully functional app in minutes'
    },
    {
      icon: Zap,
      title: 'Modern Tech Stack',
      description: 'Built with Next.js, TypeScript, and Tailwind CSS'
    },
    {
      icon: Shield,
      title: 'Production Ready',
      description: 'Deploy to Vercel with authentication and payments'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share and collaborate on your project with your team'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            CodeLaunch
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Turn your ideas into production-ready applications with AI-powered code generation
          </p>
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Start Building
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all transform hover:scale-105"
              >
                <Icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">10+</div>
            <div className="text-gray-300">Templates Available</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">5min</div>
            <div className="text-gray-300">Average Build Time</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-gray-300">Production Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
