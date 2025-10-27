'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [matrixChars, setMatrixChars] = useState<string[]>([]);

  useEffect(() => {
    // Generate random matrix characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = 15;
    const streams: string[] = [];
    
    for (let i = 0; i < columns; i++) {
      const length = Math.floor(Math.random() * 8) + 5;
      let stream = '';
      for (let j = 0; j < length; j++) {
        stream += chars[Math.floor(Math.random() * chars.length)];
      }
      streams.push(stream);
    }
    
    setMatrixChars(streams);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          CodeLaunch
        </div>
        <div className="flex gap-4">
          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="px-6 py-2 rounded-lg border border-purple-400 hover:bg-purple-400/10 transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all">
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && (
            <Link href="/dashboard">
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        {/* Rocket with Matrix Code Effect */}
        <div className="relative inline-block mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Matrix Code Background - positioned behind rocket */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="grid grid-cols-5 gap-0 h-full w-full opacity-40">
                {matrixChars.slice(0, 15).map((stream, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-start text-[8px] leading-tight font-mono text-green-400 animate-matrix-fall"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  >
                    {stream.split('').map((char, j) => (
                      <span
                        key={j}
                        className="opacity-70"
                        style={{
                          textShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rocket SVG - on top of matrix code */}
            <svg
              viewBox="0 0 100 100"
              className="relative z-10 w-full h-full animate-bounce-slow drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' }}
            >
              {/* Rocket Body */}
              <path
                d="M50 10 L60 60 L50 70 L40 60 Z"
                fill="url(#rocketGradient)"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
              
              {/* Window with glow */}
              <circle
                cx="50"
                cy="35"
                r="8"
                fill="#1e1b4b"
                stroke="#a78bfa"
                strokeWidth="1"
              />
              <circle
                cx="50"
                cy="35"
                r="6"
                fill="#312e81"
                opacity="0.8"
              />
              
              {/* Left Fin */}
              <path
                d="M40 60 L30 80 L40 70 Z"
                fill="url(#finGradient)"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
              
              {/* Right Fin */}
              <path
                d="M60 60 L70 80 L60 70 Z"
                fill="url(#finGradient)"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
              
              {/* Flame */}
              <g className="animate-pulse">
                <path
                  d="M45 70 L50 85 L55 70 Z"
                  fill="#ef4444"
                  opacity="0.9"
                />
                <path
                  d="M47 70 L50 82 L53 70 Z"
                  fill="#fbbf24"
                  opacity="0.8"
                />
              </g>
              
              {/* Gradients */}
              <defs>
                <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="finGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Build Your SaaS in Minutes
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          From idea to deployed app with AI-powered mindmaps, PRDs, and instant code generation
        </p>
        
        <div className="flex gap-4 justify-center">
          {!isSignedIn ? (
            <>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50">
                  Start Building Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 text-lg rounded-lg border border-purple-400 hover:bg-purple-400/10 transition-all">
                  Sign In
                </button>
              </SignInButton>
            </>
          ) : (
            <Link href="/dashboard">
              <button className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Everything You Need to Launch
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI Mindmap Creator</h3>
            <p className="text-gray-300">Visualize your app idea with intelligent, auto-generated mindmaps</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">PRD Generator</h3>
            <p className="text-gray-300">Transform mindmaps into comprehensive Product Requirements Documents</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold mb-2">Code Generation</h3>
            <p className="text-gray-300">Get production-ready code for your entire application instantly</p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Instant Deploy</h3>
            <p className="text-gray-300">One-click deployment to Vercel with automatic setup</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto p-12 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20">
          <h2 className="text-4xl font-bold mb-4">Ready to Launch Your Idea?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of founders building their SaaS with CodeLaunch
          </p>
          {!isSignedIn ? (
            <SignUpButton mode="modal">
              <button className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50">
                Get Started Now - It's Free
              </button>
            </SignUpButton>
          ) : (
            <Link href="/dashboard">
              <button className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-purple-500/20">
        <p>© 2025 CodeLaunch. Built with ❤️ for founders.</p>
      </footer>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes matrix-fall {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(200%);
            opacity: 0;
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-matrix-fall {
          animation: matrix-fall linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
