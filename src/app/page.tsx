'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

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
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            CodeLaunch
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            {isSignedIn && (
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex gap-3 items-center">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-5 py-2 rounded-lg border border-purple-400 hover:bg-purple-400/10 transition-all text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-lg shadow-purple-500/30">
                    Get Started Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-lg shadow-purple-500/30">
                    Go to Dashboard
                  </button>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-purple-500/50 hover:ring-purple-500 transition-all",
                      userButtonPopoverCard: "bg-gray-900 border border-purple-500/30 shadow-xl",
                      userButtonPopoverActionButton: "hover:bg-purple-500/10 text-gray-200",
                      userButtonPopoverActionButtonText: "text-gray-200",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        {/* Rocket with Matrix Code Effect */}
        <div className="relative inline-block mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Matrix Code Background */}
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

            {/* Rocket SVG */}
            <svg
              viewBox="0 0 100 100"
              className="relative z-10 w-full h-full animate-bounce-slow drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' }}
            >
              <path
                d="M50 10 L60 60 L50 70 L40 60 Z"
                fill="url(#rocketGradient)"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
              <circle cx="50" cy="35" r="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
              <circle cx="50" cy="35" r="6" fill="#312e81" opacity="0.8" />
              <path d="M40 60 L30 80 L40 70 Z" fill="url(#finGradient)" stroke="#8b5cf6" strokeWidth="1" />
              <path d="M60 60 L70 80 L60 70 Z" fill="url(#finGradient)" stroke="#8b5cf6" strokeWidth="1" />
              <g className="animate-pulse">
                <path d="M45 70 L50 85 L55 70 Z" fill="#ef4444" opacity="0.9" />
                <path d="M47 70 L50 82 L53 70 Z" fill="#fbbf24" opacity="0.8" />
              </g>
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

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Build Your SaaS in Minutes
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          From idea to deployed app with AI-powered mindmaps, PRDs, and instant code generation
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!isSignedIn ? (
            <>
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold">
                  Start Building Free →
                </button>
              </SignUpButton>
              <Link href="/pricing">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg border border-purple-400 hover:bg-purple-400/10 transition-all font-semibold">
                  View Pricing
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold">
                  Go to Dashboard →
                </button>
              </Link>
              <Link href="/pricing">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg border border-purple-400 hover:bg-purple-400/10 transition-all font-semibold">
                  View Pricing
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>No credit card required • Start free</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Everything You Need to Launch
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stop wasting time on boilerplate. Focus on building features that matter.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Mindmap Creator</h3>
            <p className="text-gray-300 leading-relaxed">
              Visualize your app idea with intelligent, auto-generated mindmaps that map out your entire product
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📄</div>
            <h3 className="text-xl font-bold mb-3 text-white">PRD Generator</h3>
            <p className="text-gray-300 leading-relaxed">
              Transform mindmaps into comprehensive Product Requirements Documents instantly
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">💻</div>
            <h3 className="text-xl font-bold mb-3 text-white">Code Generation</h3>
            <p className="text-gray-300 leading-relaxed">
              Get production-ready code for your entire application with best practices built-in
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🚀</div>
            <h3 className="text-xl font-bold mb-3 text-white">Instant Deploy</h3>
            <p className="text-gray-300 leading-relaxed">
              One-click deployment to Vercel with automatic configuration and setup
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Launch in 3 Simple Steps
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From idea to live app in minutes, not months
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-white">Describe Your Idea</h3>
              <p className="text-gray-300 text-lg">
                Tell our AI what you want to build in plain English. No technical knowledge required.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-white">Review & Customize</h3>
              <p className="text-gray-300 text-lg">
                Edit the AI-generated mindmap and PRD to match your exact vision.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-white">Deploy & Launch</h3>
              <p className="text-gray-300 text-lg">
                Generate production-ready code and deploy to Vercel with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Ready to Launch Your Idea?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join founders who are shipping their SaaS products faster than ever with CodeLaunch
          </p>
          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold">
                  Get Started Free →
                </button>
              </SignUpButton>
              <Link href="/pricing">
                <button className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg border-2 border-purple-400 hover:bg-purple-400/10 transition-all font-semibold">
                  View Pricing
                </button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <button className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold">
                Go to Dashboard →
              </button>
            </Link>
          )}
          <p className="mt-6 text-sm text-gray-400">
            No credit card required • 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-purple-500/20">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              CodeLaunch
            </div>
            <p className="text-gray-400 text-sm">
              Build and launch your SaaS in minutes with AI-powered development tools.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              {isSignedIn && (
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-purple-500/20">
          <p className="text-gray-400 text-sm">© 2025 CodeLaunch. Built with ❤️ for founders.</p>
        </div>
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
