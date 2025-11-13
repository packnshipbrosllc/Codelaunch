'use client';

import DisplayCards from '@/components/DisplayCards';
import Starfield from '@/components/Starfield';
import Link from 'next/link';
import { useUser, SignUpButton } from '@clerk/nextjs';

export default function HeroSection() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
      {/* Starfield Background */}
      <Starfield />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left animate-[fadeUp_1s_ease-out_0.3s_both]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-full text-sm text-purple-400 mb-6 backdrop-blur-sm">
              🚀 AI-Powered App Development
            </div>

            {/* Rocket Icon */}
            <div className="text-8xl lg:text-[96px] mb-6 inline-block animate-[fadeUp_1s_ease-out_0.5s_both,rocketFloat_3s_ease-in-out_1.5s_infinite]">
              🚀
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Turn Ideas Into Code
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-4 max-w-2xl mx-auto lg:mx-0">
              AI-powered workflow: Mindmap → PRD → Full-stack code in 45 minutes
            </p>

            <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0">
              No dev team. No 6-month wait. Just production-ready code.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 lg:gap-8 justify-center lg:justify-start mb-10">
              <div className="text-left">
                <div className="text-3xl lg:text-4xl font-black text-purple-500 block">45min</div>
                <div className="text-sm text-gray-500">Idea to Code</div>
              </div>
              <div className="text-left">
                <div className="text-3xl lg:text-4xl font-black text-purple-500 block">$50K+</div>
                <div className="text-sm text-gray-500">Dev Costs Saved</div>
              </div>
              <div className="text-left">
                <div className="text-3xl lg:text-4xl font-black text-purple-500 block">2,000+</div>
                <div className="text-sm text-gray-500">Apps Built</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-200">
                    Start Building Free
                    <span>→</span>
                  </button>
                </SignUpButton>
              ) : (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-200"
                >
                  Start Building Free
                  <span>→</span>
                </Link>
              )}
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl font-bold text-lg text-white hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200">
                Watch Demo
              </button>
            </div>

            {/* Trust Badge */}
            <div className="text-sm text-gray-500 flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-purple-500">✓</span>
              3 free mindmaps • No credit card required
            </div>
          </div>

          {/* Right Column - Display Cards */}
          <div className="hidden lg:block">
            <DisplayCards />
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

