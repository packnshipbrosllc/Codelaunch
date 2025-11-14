'use client';

import { useRef } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';

// Real Official Logo Components

const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const VercelLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M12 1L24 22H0L12 1z"/>
  </svg>
);

const SupabaseLogo = () => (
  <svg viewBox="0 0 109 113" fill="none" className="w-10 h-10">
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
    <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
    <defs>
      <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361"/>
        <stop offset="1" stopColor="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const ClaudeLogo = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-10 h-10">
    <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
  </svg>
);

const CursorLogo = () => (
  <svg viewBox="0 0 256 256" fill="none" className="w-10 h-10">
    <path d="M86.4 53.1852V139.926L105.186 121.141L111.556 145.778L143.852 116.222L137.482 91.5852L156.267 110.37V23.6296L86.4 53.1852Z" fill="currentColor"/>
    <circle cx="128" cy="128" r="4" fill="currentColor"/>
  </svg>
);

const LovableLogo = () => (
  // Lovable's actual logo - stylized heart/L shape
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M21.02 5.38c-1.32-1.32-3.44-1.32-4.76 0L12 9.64 7.74 5.38c-1.32-1.32-3.44-1.32-4.76 0-1.32 1.32-1.32 3.44 0 4.76L12 19.16l9.02-9.02c1.32-1.32 1.32-3.44 0-4.76z"/>
    <path d="M3 4h4v12H3z" opacity="0.6"/>
  </svg>
);

const BoltLogo = () => (
  // Bolt/StackBlitz logo - lightning bolt
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
  </svg>
);

const V0Logo = () => (
  // Vercel v0 logo
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M12 1L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7l-10-6z"/>
    <text x="12" y="16" fontSize="9" fontWeight="bold" textAnchor="middle" fill="white">v0</text>
  </svg>
);

export function CodeLaunchIntegrations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const codeLaunchRef = useRef<HTMLDivElement>(null);
  
  // Left side
  const githubRef = useRef<HTMLDivElement>(null);
  const vercelRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<HTMLDivElement>(null);
  const claudeRef = useRef<HTMLDivElement>(null);
  
  // Right side
  const cursorRef = useRef<HTMLDivElement>(null);
  const lovableRef = useRef<HTMLDivElement>(null);
  const boltRef = useRef<HTMLDivElement>(null);
  const v0Ref = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-24 bg-[#0a0a0f] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Everything Flows Into CodeLaunch
          </span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Connect all your favorite tools. One platform to rule them all.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative flex h-[600px] w-full max-w-6xl mx-auto items-center justify-center overflow-hidden px-4"
      >
        {/* Left Side Platforms */}
        <div className="flex flex-col justify-center gap-6 absolute left-12 lg:left-24">
          <div
            ref={githubRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-white"><GitHubLogo /></div>
            <div className="absolute left-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">GitHub</div>
          </div>

          <div
            ref={vercelRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-black to-gray-900 border border-gray-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-white"><VercelLogo /></div>
            <div className="absolute left-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Vercel</div>
          </div>

          <div
            ref={supabaseRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-900 to-emerald-950 border border-green-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <SupabaseLogo />
            <div className="absolute left-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Supabase</div>
          </div>

          <div
            ref={claudeRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-900 to-amber-950 border border-orange-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-orange-400"><ClaudeLogo /></div>
            <div className="absolute left-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Claude AI</div>
          </div>
        </div>

        {/* Center - CodeLaunch */}
        <div ref={codeLaunchRef} className="relative z-10 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 border-4 border-purple-400 shadow-2xl">
              <div className="text-6xl animate-bounce-slow">🚀</div>
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold text-sm shadow-lg">
                CodeLaunch
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Platforms */}
        <div className="flex flex-col justify-center gap-6 absolute right-12 lg:right-24">
          <div
            ref={cursorRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-blue-400"><CursorLogo /></div>
            <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Cursor</div>
          </div>

          <div
            ref={lovableRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-900 to-rose-950 border border-pink-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-pink-400"><LovableLogo /></div>
            <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Lovable</div>
          </div>

          <div
            ref={boltRef}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-900 to-orange-950 border border-yellow-800 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-yellow-400"><BoltLogo /></div>
            <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">Bolt</div>
          </div>

          <div
            ref={v0Ref}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 shadow-xl hover:scale-110 transition-transform cursor-pointer group"
          >
            <div className="text-slate-400"><V0Logo /></div>
            <div className="absolute right-24 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-3 py-1 rounded-lg text-sm text-white whitespace-nowrap">v0 by Vercel</div>
          </div>
        </div>

        {/* ALL BEAMS FLOW INTO CodeLaunch */}
        <AnimatedBeam containerRef={containerRef} fromRef={githubRef} toRef={codeLaunchRef} curvature={-30} gradientStartColor="#9333ea" gradientStopColor="#ec4899" duration={3} />
        <AnimatedBeam containerRef={containerRef} fromRef={vercelRef} toRef={codeLaunchRef} curvature={0} gradientStartColor="#9333ea" gradientStopColor="#ec4899" duration={3} delay={0.3} />
        <AnimatedBeam containerRef={containerRef} fromRef={supabaseRef} toRef={codeLaunchRef} curvature={30} gradientStartColor="#9333ea" gradientStopColor="#ec4899" duration={3} delay={0.6} />
        <AnimatedBeam containerRef={containerRef} fromRef={claudeRef} toRef={codeLaunchRef} curvature={60} gradientStartColor="#9333ea" gradientStopColor="#ec4899" duration={3} delay={0.9} />
        <AnimatedBeam containerRef={containerRef} fromRef={cursorRef} toRef={codeLaunchRef} curvature={-30} gradientStartColor="#ec4899" gradientStopColor="#9333ea" duration={3} delay={0.2} />
        <AnimatedBeam containerRef={containerRef} fromRef={lovableRef} toRef={codeLaunchRef} curvature={0} gradientStartColor="#ec4899" gradientStopColor="#9333ea" duration={3} delay={0.5} />
        <AnimatedBeam containerRef={containerRef} fromRef={boltRef} toRef={codeLaunchRef} curvature={30} gradientStartColor="#ec4899" gradientStopColor="#9333ea" duration={3} delay={0.8} />
        <AnimatedBeam containerRef={containerRef} fromRef={v0Ref} toRef={codeLaunchRef} curvature={60} gradientStartColor="#ec4899" gradientStopColor="#9333ea" duration={3} delay={1.1} />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-16 text-center">
        <p className="text-gray-400 leading-relaxed text-lg">
          <span className="text-purple-400 font-semibold">The universal hub for AI development.</span>
          {' '}Import from GitHub, Vercel, or Supabase. Connect with Claude, Cursor, Lovable, Bolt, and v0. 
          CodeLaunch brings everything together in one place.
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

