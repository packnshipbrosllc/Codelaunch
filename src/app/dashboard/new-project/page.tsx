'use client';

import { SpaceBackground } from '@/components/ui/space-background';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please describe your app idea');
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: message.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle limit reached error
        if (response.status === 403 && errorData.error === 'FREE_LIMIT_REACHED') {
          setError(errorData.message || 'You\'ve reached your free mindmap limit. Please upgrade to Pro.');
          setIsCreating(false);
          return;
        }
        
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const encodedData = encodeURIComponent(JSON.stringify(result.data));
        router.push(`/create?mindmap=${encodedData}`);
      } else {
        throw new Error(result.error || 'Failed to generate mindmap');
      }
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(error.message || 'An error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <SpaceBackground variant="default">
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        {isCreating ? (
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6">
                <Loader2 className="w-24 h-24 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Creating your project...</h2>
            <p className="text-white/60">Generating feature roadmap with AI</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                What do you want to build?
              </h1>
              <p className="text-white/60 text-lg">
                Describe your app idea and we'll create a comprehensive feature roadmap
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl overflow-hidden">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                  className="w-full h-40 px-6 py-5 bg-transparent text-white placeholder-white/30 resize-none focus:outline-none text-base"
                  disabled={isCreating}
                />
                
                <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
                  <p className="text-xs text-white/40">
                    Be as detailed as possible for better results
                  </p>
                  <button
                    type="submit"
                    disabled={isCreating || !message.trim()}
                    className="px-6 py-2.5 bg-white hover:bg-gray-100 disabled:bg-white/20 text-black disabled:text-white/40 font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>{isCreating ? 'Creating...' : 'Generate Mindmap'}</span>
                    {!isCreating && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Quick Example Prompts */}
            <div className="mt-8">
              <p className="text-white/40 text-sm text-center mb-3">Need inspiration? Try these:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "E-commerce store with inventory management",
                  "Social fitness app with challenges",
                  "Recipe sharing platform with meal planning",
                  "Project management tool with time tracking"
                ].map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(example)}
                    className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg text-xs text-white/60 hover:text-white/90 transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SpaceBackground>
  );
}
