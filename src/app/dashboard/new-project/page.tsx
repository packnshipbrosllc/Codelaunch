// src/app/dashboard/new-project/page.tsx
'use client';

import { SpaceBackground } from '@/components/ui/space-background';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectSubmit = async (message: string) => {
    if (!message || message.trim().length === 0) {
      setError('Please describe your app idea');
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      // Use the existing generate-mindmap API that was working
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea: message.trim()
        })
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
        // Redirect to create page with the generated mindmap data
        // The create page will handle displaying and saving it
        const encodedData = encodeURIComponent(JSON.stringify(result.data));
        router.push(`/create?mindmap=${encodedData}`);
        // Don't set isCreating to false - we're redirecting
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
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6">
                  <Loader2 className="w-24 h-24 text-white animate-spin" />
                </div>
                <motion.div
                  className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-blue-500/20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Creating your project...</h2>
              <p className="text-white/60">Generating feature roadmap with AI</p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <AnimatedAIChat 
                onSubmit={handleProjectSubmit}
                placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                title="What do you want to build?"
                subtitle="Describe your app idea in detail and we'll create a comprehensive feature roadmap"
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center backdrop-blur-sm"
                >
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpaceBackground>
  );
}
