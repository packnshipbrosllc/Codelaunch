'use client';

import { useRef } from 'react';
import { Github, Sparkles, Terminal, Heart, Triangle, Zap } from 'lucide-react';
import { AnimatedBeam } from '@/components/ui/animated-beam';

export function CodeLaunchIntegrations() {
  // FIX: Use non-null assertion to satisfy TypeScript
  const containerRef = useRef<HTMLDivElement>(null!);
  const codeLaunchRef = useRef<HTMLDivElement>(null!);
  const githubRef = useRef<HTMLDivElement>(null!);
  const claudeRef = useRef<HTMLDivElement>(null!);
  const cursorRef = useRef<HTMLDivElement>(null!);
  const lovableRef = useRef<HTMLDivElement>(null!);

  return (
    <section className="relative py-32 bg-transparent overflow-visible">
      {/* REMOVED: No gradient overlay that blocks content */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Connect Your Entire Workflow
          </span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          From code repositories to AI assistants, CodeLaunch integrates with everything you use.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative flex h-[400px] w-full max-w-7xl mx-auto items-center justify-center overflow-visible px-8"
      >
        {/* Left Side */}
        <div className="flex flex-col justify-center gap-16 absolute left-[15%] z-10">
          <div
            ref={githubRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <Github className="w-8 h-8 text-gray-300" />
            <div className="absolute left-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              GitHub
            </div>
          </div>

          <div
            ref={claudeRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div className="absolute left-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Claude AI
            </div>
          </div>
        </div>

        {/* Center - Lower z-index so beams don't cover icons */}
        <div ref={codeLaunchRef} className="relative z-5 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-[60px] opacity-50 animate-pulse"></div>
            <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 border-4 border-purple-400 shadow-2xl">
              <div className="text-7xl animate-bounce-slow">🚀</div>
            </div>
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg shadow-2xl">
                CodeLaunch
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Higher z-index to show above beams */}
        <div className="flex flex-col justify-center gap-16 absolute right-[15%] z-10">
          <div
            ref={cursorRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <Terminal className="w-8 h-8 text-blue-400" />
            <div className="absolute right-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Cursor
            </div>
          </div>

          <div
            ref={lovableRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <Heart className="w-8 h-8 text-pink-400" />
            <div className="absolute right-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Lovable
            </div>
          </div>
        </div>

        {/* Animated Beams - Lower z-index (default) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={githubRef}
          toRef={codeLaunchRef}
          curvature={-20}
          gradientStartColor="#9333ea"
          gradientStopColor="#ec4899"
          duration={3}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={claudeRef}
          toRef={codeLaunchRef}
          curvature={20}
          gradientStartColor="#9333ea"
          gradientStopColor="#ec4899"
          duration={3}
          delay={0.5}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={cursorRef}
          toRef={codeLaunchRef}
          curvature={-20}
          gradientStartColor="#ec4899"
          gradientStopColor="#9333ea"
          duration={3}
          delay={0.3}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={lovableRef}
          toRef={codeLaunchRef}
          curvature={20}
          gradientStartColor="#ec4899"
          gradientStopColor="#9333ea"
          duration={3}
          delay={0.8}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-24 text-center">
        <p className="text-gray-400 leading-relaxed text-lg">
          <span className="text-purple-400 font-semibold">One hub. Infinite possibilities.</span>
          {' '}Pull from GitHub, enhance with Claude AI, then export to Cursor or Lovable. 
          CodeLaunch orchestrates your entire development workflow.
        </p>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
