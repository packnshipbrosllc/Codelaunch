'use client';

import DisplayCards from '@/components/DisplayCards';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Turn Your App Idea
                <br />
                Into Code in Days
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              AI-powered workflow: Mindmap → PRD → Full-stack code → Deployment. 
              No dev team needed. Start building free.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start mb-10">
              <div>
                <div className="text-3xl font-black text-purple-500">45min</div>
                <div className="text-sm text-gray-500">Idea to Code</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-500">$50K+</div>
                <div className="text-sm text-gray-500">Dev Costs Saved</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-500">2,000+</div>
                <div className="text-sm text-gray-500">Apps Built</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              <Link
                href="/create"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Building Free
              </Link>
              <button className="px-8 py-4 bg-white/5 border-2 border-purple-500/30 rounded-xl font-bold text-lg text-white hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200">
                Watch Demo
              </button>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-gray-500 flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-purple-500">✓</span>
              3 free mindmaps • No credit card required
            </p>
          </div>

          {/* Right Column - Display Cards */}
          <div className="hidden lg:block">
            <DisplayCards />
          </div>
        </div>
      </div>
    </section>
  );
}

