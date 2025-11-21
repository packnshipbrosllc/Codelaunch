'use client';

import { useRef } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';

export function CodeLaunchIntegrations() {
  const containerRef = useRef<HTMLDivElement>(null!);
  const codeLaunchRef = useRef<HTMLDivElement>(null!);
  const githubRef = useRef<HTMLDivElement>(null!);
  const claudeRef = useRef<HTMLDivElement>(null!);
  const cursorRef = useRef<HTMLDivElement>(null!);
  const lovableRef = useRef<HTMLDivElement>(null!);

  return (
    <section className="relative py-32 bg-transparent overflow-visible">
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
          {/* GitHub - SVG Logo */}
          <div
            ref={githubRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <div className="absolute left-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              GitHub
            </div>
          </div>

          {/* Claude AI - Gradient Icon */}
          <div
            ref={claudeRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              C
            </div>
            <div className="absolute left-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Claude AI
            </div>
          </div>
        </div>

        {/* Center */}
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

        {/* Right Side */}
        <div className="flex flex-col justify-center gap-16 absolute right-[15%] z-10">
          {/* Cursor - Pointer Icon */}
          <div
            ref={cursorRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                <path d="M13 13l6 6"/>
              </svg>
            </div>
            <div className="absolute right-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Cursor
            </div>
          </div>

          {/* Lovable - Heart Icon */}
          <div
            ref={lovableRef}
            className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-2xl hover:scale-110 hover:bg-white/10 hover:brightness-110 transition-all duration-300 cursor-pointer group"
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="url(#loveGradient)">
              <defs>
                <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#ec4899'}} />
                  <stop offset="50%" style={{stopColor: '#f472b6'}} />
                  <stop offset="100%" style={{stopColor: '#fb923c'}} />
                </linearGradient>
              </defs>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <div className="absolute right-28 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap border border-gray-700 z-50">
              Lovable
            </div>
          </div>
        </div>

        {/* Animated Beams */}
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