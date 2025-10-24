import React from 'react';
import { CheckCircle, ExternalLink, Download, Github, Rocket, Copy } from 'lucide-react';

interface SuccessStageProps {
  appData: any;
  onRestart: () => void;
}

export default function SuccessStage({ appData, onRestart }: SuccessStageProps) {
  const appUrl = `https://${(appData?.name || 'my-app').toLowerCase().replace(/\s+/g, '-')}.vercel.app`;
  const githubUrl = `https://github.com/youruser/${(appData?.name || 'my-app').toLowerCase().replace(/\s+/g, '-')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const links = [
    { 
      name: 'Live App', 
      url: appUrl, 
      icon: ExternalLink, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Your deployed application'
    },
    { 
      name: 'GitHub Repo', 
      url: githubUrl, 
      icon: Github, 
      color: 'from-gray-600 to-gray-800',
      description: 'Source code repository'
    },
    { 
      name: 'Admin Dashboard', 
      url: `${appUrl}/admin`, 
      icon: ExternalLink, 
      color: 'from-purple-500 to-pink-500',
      description: 'Manage your app settings'
    }
  ];

  const nextSteps = [
    'Connect your custom domain',
    'Configure environment variables',
    'Set up your database',
    'Add your Stripe API keys',
    'Invite team members',
    'Deploy to production'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="inline-block mb-6">
            <CheckCircle className="w-24 h-24 text-green-400 animate-bounce" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            🎉 Your App is Live!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {appData?.name || 'Your application'} has been successfully generated, configured, and deployed to production.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-br ${link.color} rounded-xl p-6 hover:scale-105 transition-transform group`}
              >
                <Icon className="w-8 h-8 text-white mb-3" />
                <h3 className="text-white font-bold text-lg mb-1">{link.name}</h3>
                <p className="text-white/80 text-sm">{link.description}</p>
                <div className="mt-3 text-white/60 text-xs group-hover:text-white/100 transition-colors">
                  Open →
                </div>
              </a>
            );
          })}
        </div>

        {/* App Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">App Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <span className="text-gray-300">Production URL</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{appUrl}</span>
                <button
                  onClick={() => copyToClipboard(appUrl)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <span className="text-gray-300">Repository</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{githubUrl}</span>
                <button
                  onClick={() => copyToClipboard(githubUrl)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <span className="text-gray-300">Status</span>
              <span className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live & Running
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            View Live App
          </a>
          
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Build Another App
          </button>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-white/20"
          >
            <Download className="w-5 h-5" />
            Download Code
          </a>
        </div>
      </div>
    </div>
  );
}
