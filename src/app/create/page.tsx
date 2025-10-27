// src/app/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import MindmapFlow from '@/components/MindmapFlow';
import { MindmapData } from '@/types/mindmap';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  const handleGenerate = async () => {
    if (!idea.trim() || idea.trim().length < 10) {
      setError('Please provide a detailed app idea (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate mindmap');
      }

      setMindmapData(result.data);
    } catch (err: any) {
      console.error('Error generating mindmap:', err);
      setError(err.message || 'Failed to generate mindmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!mindmapData || !user) return;

    try {
      const response = await fetch('/api/save-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mindmapData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Mindmap saved successfully!');
        router.push('/dashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error('Error saving mindmap:', err);
      alert('Failed to save mindmap: ' + err.message);
    }
  };

  const exampleIdeas = [
    "A SaaS platform where therapists can manage appointments, client notes, and secure messaging",
    "An AI-powered chatbot for customer support with conversation history and analytics dashboard",
    "A mobile app for tracking daily habits with reminders, progress charts, and social sharing",
    "A project management tool for remote teams with kanban boards, time tracking, and video calls",
    "An e-commerce platform for digital art with creator profiles, NFT integration, and royalty tracking"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Your Project
          </h1>
          <p className="text-gray-400 text-lg">
            Describe your SaaS idea and let AI generate a comprehensive mindmap
          </p>
        </div>

        {!mindmapData ? (
          <div className="max-w-4xl mx-auto">
            {/* Input Section */}
            <div className="bg-gray-800/50 rounded-2xl border border-purple-500/20 p-8 backdrop-blur-sm">
              <label className="block mb-4">
                <span className="text-lg font-semibold mb-2 block">
                  Describe Your App Idea 💡
                </span>
                <textarea
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setError('');
                  }}
                  placeholder="Example: A SaaS platform that helps freelancers manage their invoices, track time, and accept payments from clients. It should have a beautiful dashboard, automated reminders, and integrate with Stripe for payments..."
                  className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
              </label>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !idea.trim()}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Mindmap
                    </>
                  )}
                </button>
              </div>

              {/* Example Ideas */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Need inspiration? Try these examples:
                </h3>
                <div className="space-y-2">
                  {exampleIdeas.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setIdea(example)}
                      disabled={isGenerating}
                      className="w-full text-left px-4 py-3 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-purple-500/50 rounded-lg text-sm text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-400">
                  GPT-4o-mini analyzes your idea and generates a structured mindmap
                </p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="font-semibold mb-2">Competitor Research</h3>
                <p className="text-sm text-gray-400">
                  Identifies top 3 competitors and your unique advantages
                </p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-semibold mb-2">Tech Stack Suggestions</h3>
                <p className="text-sm text-gray-400">
                  Recommends the best technologies for your specific use case
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Mindmap Display */
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{mindmapData.projectName}</h2>
                <p className="text-gray-400">{mindmapData.projectDescription}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMindmapData(null);
                    setIdea('');
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
                >
                  ← Start Over
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all shadow-lg"
                >
                  💾 Save & Continue
                </button>
              </div>
            </div>

            <MindmapFlow data={mindmapData} onSave={handleSave} />

            {/* Next Steps */}
            <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-purple-500/20">
              <h3 className="text-xl font-semibold mb-4">🎯 Next Steps:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Save this mindmap to your dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">→</span>
                  <span>Generate a detailed PRD (Product Requirements Document)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">→</span>
                  <span>Generate production-ready code with Claude Sonnet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">→</span>
                  <span>Deploy to Vercel with one click</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

