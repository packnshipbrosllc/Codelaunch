'use client';

import { SpaceBackground } from '@/components/ui/space-background';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, SendIcon, Sparkles } from 'lucide-react';

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
        console.log('🔄 Redirecting with data length:', encodedData.length);
        console.log('🔄 Full URL (first 200 chars):', `/create?mindmap=${encodedData.substring(0, 200)}...`);
        console.log('🔄 Original data keys:', Object.keys(result.data));
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

  const quickPrompts = [
    "E-commerce store with inventory management",
    "Social fitness app with challenges",
    "Recipe sharing platform with meal planning",
    "Project management tool with time tracking"
  ];

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl"
            >
              {/* Header */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent pb-2 mb-4">
                  What do you want to build?
                </h1>
                <motion.div 
                  className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent max-w-md mx-auto mb-4"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
                <p className="text-base text-white/50">
                  Describe your app idea in detail and we'll create a comprehensive feature roadmap
                </p>
              </motion.div>

              {/* Chat Interface */}
              <motion.form 
                onSubmit={handleSubmit}
                className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl overflow-hidden"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim()) {
                          handleSubmit(e as any);
                        }
                      }
                    }}
                    placeholder="Example: A fitness tracking app with workout plans, progress tracking, and social features..."
                    className="w-full min-h-[100px] px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20"
                    disabled={isCreating}
                  />
                </div>

                <div className="px-4 pb-4 border-t border-white/[0.05] pt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-powered generation</span>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCreating || !message.trim()}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      message.trim()
                        ? 'bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/20'
                        : 'bg-white/[0.05] text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <span>Generate Mindmap</span>
                    <SendIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.form>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-400 text-center text-sm">{error}</p>
                </motion.div>
              )}

              {/* Quick Prompts */}
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-white/40 text-sm text-center mb-3">Need inspiration? Try these:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(prompt)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all border border-white/[0.05] hover:border-white/10"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpaceBackground>
  );
}
