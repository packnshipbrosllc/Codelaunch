'use client';

import Starfield from '@/components/Starfield';
import HeroMockup from '@/components/sections/HeroMockup';
import DisplayCards from '@/components/ui/display-cards';
import Link from 'next/link';
import { useUser, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Network, FileText, Code, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      fetch('/api/user/onboarding-status')
        .then(r => r.json())
        .then(data => setHasCompletedOnboarding(data.completed))
        .catch(() => setHasCompletedOnboarding(true)); // On error, allow through
    }
  }, [isSignedIn, isLoaded]);

  const handleStartBuilding = async () => {
    if (!isSignedIn) {
      // Not logged in - SignUpButton will handle it
      return;
    }

    // User is logged in - check onboarding status
    try {
      const response = await fetch('/api/user/onboarding-status');
      const data = await response.json();

      if (!data.completed) {
        // Not completed onboarding - force them there
        router.push('/onboarding');
      } else {
        // Completed onboarding - can use builder
        router.push('/create');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // On error, allow through to create
      router.push('/create');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
      {/* Starfield Background */}
      <Starfield />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Top Section - Headline with DisplayCards on the side */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          {/* Left: DisplayCards */}
          <div className="relative z-20">
            {/* Desktop: Stacked cards with fan spread effect */}
            <div className="hidden md:flex justify-center animate-[fadeUp_1s_ease-out_0.5s_both]">
              <DisplayCards 
                cards={[
                  {
                    icon: <Network className="w-6 h-6 text-purple-400" />,
                    title: "AI Mindmaps",
                    description: "Visualize your entire app architecture. Every feature, flow, and dependency mapped instantly.",
                    date: "Core Feature",
                    iconClassName: "text-purple-400",
                    titleClassName: "text-purple-400",
                    className:
                      // Base position: bottom of stack
                      "[grid-area:stack]" +
                      // Hover: lift up dramatically
                      " hover:-translate-y-32 hover:z-50" +
                      // Styling
                      " border-purple-500/30 bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-black/90 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/40 hover:border-purple-500" +
                      // Grayscale overlay
                      " before:absolute before:inset-0 before:rounded-2xl before:bg-gray-900/60 before:opacity-100 hover:before:opacity-0 before:transition-opacity before:duration-500 before:pointer-events-none" +
                      " grayscale hover:grayscale-0 transition-all duration-500",
                  },
                  {
                    icon: <FileText className="w-6 h-6 text-pink-400" />,
                    title: "PRD Generation",
                    description: "Production-ready documentation with user stories, API specs, and database schemas.",
                    date: "Core Feature",
                    iconClassName: "text-pink-400",
                    titleClassName: "text-pink-400",
                    className:
                      // Base position: middle of stack
                      "[grid-area:stack] translate-x-12 translate-y-8" +
                      // Hover: lift up medium
                      " hover:translate-x-12 hover:-translate-y-16 hover:z-50" +
                      // Styling
                      " border-pink-500/30 bg-gradient-to-br from-gray-900/90 via-pink-900/50 to-black/90 shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/40 hover:border-pink-500" +
                      // Grayscale overlay
                      " before:absolute before:inset-0 before:rounded-2xl before:bg-gray-900/60 before:opacity-100 hover:before:opacity-0 before:transition-opacity before:duration-500 before:pointer-events-none" +
                      " grayscale hover:grayscale-0 transition-all duration-500",
                  },
                  {
                    icon: <Code className="w-6 h-6 text-blue-400" />,
                    title: "Code Generation",
                    description: "Full-stack Next.js with auth, database, UI components. Export to any editor.",
                    date: "Core Feature",
                    iconClassName: "text-blue-400",
                    titleClassName: "text-blue-400",
                    className:
                      // Base position: top of stack
                      "[grid-area:stack] translate-x-24 translate-y-16" +
                      // Hover: lift up slightly (already at top)
                      " hover:translate-x-24 hover:translate-y-4 hover:z-50" +
                      // Styling
                      " border-blue-500/30 bg-gradient-to-br from-gray-900/90 via-blue-900/50 to-black/90 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 hover:border-blue-500" +
                      // Grayscale overlay
                      " before:absolute before:inset-0 before:rounded-2xl before:bg-gray-900/60 before:opacity-100 hover:before:opacity-0 before:transition-opacity before:duration-500 before:pointer-events-none" +
                      " grayscale hover:grayscale-0 transition-all duration-500",
                  },
                ]}
              />
            </div>

            {/* Mobile: Simple grid */}
            <div className="md:hidden max-w-6xl mx-auto px-4 grid grid-cols-1 gap-4 animate-[fadeUp_1s_ease-out_0.5s_both]">
              {/* Card 1: AI Mindmaps */}
              <div className="bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-500/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-purple-500/30">
                  <Network className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Mindmaps</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Visualize your entire app architecture. Every feature, flow, and dependency mapped instantly.</p>
              </div>

              {/* Card 2: PRD Generation */}
              <div className="bg-gradient-to-br from-gray-900/90 via-pink-900/50 to-black/90 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 shadow-xl shadow-pink-500/20">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 border border-pink-500/30">
                  <FileText className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">PRD Generation</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Production-ready documentation with user stories, API specs, and database schemas.</p>
              </div>

              {/* Card 3: Code Generation */}
              <div className="bg-gradient-to-br from-gray-900/90 via-blue-900/50 to-black/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl shadow-blue-500/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Code Generation</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Full-stack Next.js with auth, database, UI components. Export to any editor.</p>
              </div>
            </div>
          </div>

          {/* Right: Headline and CTAs */}
          <div className="text-center lg:text-left animate-[fadeUp_1s_ease-out_0.3s_both]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-full text-sm text-purple-400 mb-6 backdrop-blur-sm">
              🚀 AI-Powered App Development
            </div>

            {/* Rocket Icon */}
            <div className="text-6xl sm:text-8xl mb-6 inline-block animate-[fadeUp_1s_ease-out_0.5s_both,rocketFloat_3s_ease-in-out_1.5s_infinite]">
              🚀
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Turn Ideas Into Code
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-4 lg:max-w-2xl">
              AI-powered workflow: Mindmap → PRD → Full-stack code in weeks
            </p>

            <p className="text-base sm:text-lg text-gray-500 mb-8 lg:max-w-2xl">
              No dev team. No 6-month wait. Just production-ready code.
            </p>

            {/* Trust Badge */}
            <div className="text-sm text-gray-500 flex items-center gap-2 justify-center lg:justify-start mb-8">
              <span className="text-purple-500">✓</span>
              3 free mindmaps • No credit card required
            </div>
          </div>
        </div>

        {/* Hero Mockup - Split View */}
        <div className="animate-[fadeUp_1s_ease-out_0.8s_both] mb-20">
          <HeroMockup />
        </div>


        {/* Bottom CTA Section */}
        <div className="text-center animate-[fadeUp_1s_ease-out_1.4s_both]">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isSignedIn ? (
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-200">
                  Start Building Free
                  <span>→</span>
                </button>
              </SignUpButton>
            ) : (
              <button
                onClick={handleStartBuilding}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-200"
              >
                Start Building Free
                <span>→</span>
              </button>
            )}
            <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl font-bold text-lg text-white hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200">
              View Sample Code
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rocketFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(-5deg); 
          }
        }
      `}</style>
    </section>
  );
}

