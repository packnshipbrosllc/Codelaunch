'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/sections/HeroSection';
import { CodeLaunchIntegrations } from '@/components/CodeLaunchIntegrations';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'yearly' | null>(null);
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
      // Not logged in - go to sign up
      router.push('/sign-up');
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - could send to API endpoint
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you at ' + contactForm.email);
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/');
      return;
    }

    setCheckoutLoading(plan);

    try {
      const priceId = plan === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      const response = await fetch(`${window.location.origin}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-purple-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="flex items-center gap-3"
          >
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-bold text-white">
              Code<span className="text-purple-400">Launch</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">
              How It Works
            </Link>
            <Link href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">
              Contact
            </Link>
            {isSignedIn && hasCompletedOnboarding && (
              <Link href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">
                Dashboard
              </Link>
            )}
            {isSignedIn && !hasCompletedOnboarding && (
              <Link href="/onboarding" className="text-gray-300 hover:text-purple-400 transition-colors">
                Complete Setup
              </Link>
            )}
          </nav>

          <div className="flex gap-3 items-center">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-purple-600/20">
                    Start Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                {hasCompletedOnboarding ? (
                  <Link href="/dashboard">
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-purple-600/20">
                      Dashboard
                    </button>
                  </Link>
                ) : (
                  <Link href="/onboarding">
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-purple-600/20">
                      Complete Setup
                    </button>
                  </Link>
                )}
                <UserButton 
                  afterSignOutUrl="/"
                  userProfileMode="navigation"
                  userProfileUrl="/user-profile"
                />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with DisplayCards */}
      <HeroSection />

      {/* ALL SECTIONS BELOW HERO - Wrapped in z-10 container to appear above starfield */}
      <div className="relative z-10 bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            From Idea to Live App in 3 Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Describe Your Idea
              </h3>
              <p className="text-gray-300">
                Tell our AI what you want to build in plain English. No technical knowledge required. 
                Get an intelligent mindmap of your entire product.
              </p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Review & Customize
              </h3>
              <p className="text-gray-300">
                Edit the AI-generated mindmap and PRD to match your exact vision. 
                Add features, remove complexity, make it yours.
              </p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Generate & Deploy
              </h3>
              <p className="text-gray-300">
                Get production-ready code with best practices built-in. 
                Deploy to Vercel with one click. Go live in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Ship Fast
            </h2>
            <p className="text-gray-300 text-lg">
              Powerful AI features that turn your ideas into production-ready applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* AI Mindmap Creator */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-purple-600/30 transition">
                  🧠
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    AI Mindmap Creator
                  </h3>
                  <p className="text-gray-300">
                    Visualize your entire application architecture instantly. Our AI analyzes your idea 
                    and creates an intelligent mindmap showing all features, user flows, and technical requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* PRD Generation */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-purple-600/30 transition">
                  📋
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    PRD Generation
                  </h3>
                  <p className="text-gray-300">
                    Transform your mindmap into a comprehensive Product Requirements Document. 
                    Get detailed specifications, user stories, and technical requirements ready for development.
                  </p>
                </div>
              </div>
            </div>

            {/* Code Generation */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-purple-600/30 transition">
                  💻
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Code Generation
                  </h3>
                  <p className="text-gray-300">
                    Get production-ready, fully functional code for your entire application. 
                    Built with modern best practices, authentication, payments, and database integration included.
                  </p>
                </div>
              </div>
            </div>

            {/* Instant Deploy */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30 hover:border-purple-600/50 transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-purple-600/30 transition">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Instant Deploy
                  </h3>
                  <p className="text-gray-300">
                    Deploy your application to Vercel with a single click. 
                    Your app goes live with automatic SSL, CDN, and global edge network—no DevOps required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlight banner */}
          <div className="bg-gradient-to-r from-purple-600/10 via-purple-500/10 to-purple-600/10 border border-purple-600/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              All Features Included in Every Plan
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              No hidden tiers. No feature gates. Every paid plan gets full access to our entire platform.
            </p>
            {!isSignedIn ? (
              <SignUpButton mode="modal">
                <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold transition">
                  Start Building Now
                </button>
              </SignUpButton>
            ) : (
              <button
                onClick={handleStartBuilding}
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                {hasCompletedOnboarding ? 'Go to Dashboard' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <CodeLaunchIntegrations />

      {/* ROI Section with Code Ownership */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
              The Real Cost of Building From Scratch
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Time is money. Here's what you're actually spending.
            </p>
          </div>

          {/* Code Ownership Emphasis - Prominent Green Banner */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 rounded-2xl p-8 md:p-12 text-white mb-8 shadow-2xl shadow-green-500/20 border-2 border-green-400/30">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">You Own 100% of the Code</h3>
              <p className="text-green-50 text-xl md:text-2xl mb-8 leading-relaxed">
                This isn't a SaaS platform where you're locked in forever. When you subscribe, you download 
                the complete source code. It's <span className="font-bold text-white">yours to keep, modify, and use forever</span>.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/15 backdrop-blur rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="text-3xl mb-3">🔓</div>
                  <div className="font-bold text-lg mb-2">No Vendor Lock-in</div>
                  <div className="text-green-100 text-sm">Host anywhere you want. Your infrastructure, your rules.</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="text-3xl mb-3">⚙️</div>
                  <div className="font-bold text-lg mb-2">Modify Freely</div>
                  <div className="text-green-100 text-sm">Change anything you need. Full source code access.</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="text-3xl mb-3">♾️</div>
                  <div className="font-bold text-lg mb-2">Keep Forever</div>
                  <div className="text-green-100 text-sm">Even if you cancel, you keep everything you've downloaded.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Start free. Upgrade when you're ready to build.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <p className="text-gray-400">Try it out</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>3 mindmap generations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Full editing & export</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>See the workflow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>No credit card required</span>
                </li>
              </ul>

              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition border border-purple-900/30">
                    Start Free
                  </button>
                </SignUpButton>
              ) : (
                <button
                  onClick={handleStartBuilding}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition border border-purple-900/30"
                >
                  {hasCompletedOnboarding ? 'Go to Dashboard' : 'Complete Setup'}
                </button>
              )}
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-purple-900/30 to-gray-900/50 p-8 rounded-xl border-2 border-purple-600 relative shadow-xl shadow-purple-600/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $39<span className="text-xl text-gray-400">.99/mo</span>
                </div>
                <p className="text-gray-400">For serious builders</p>
        </div>

              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong className="text-white">Unlimited mindmaps</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong className="text-white">Unlimited PRD generation</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong className="text-white">5 code generations/month</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>One-click deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Own the code forever</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>

              <button
                onClick={() => handleCheckout('monthly')}
                disabled={checkoutLoading === 'monthly'}
                className={`w-full py-3 rounded-lg font-medium transition shadow-lg ${
                  checkoutLoading === 'monthly'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
              >
                {checkoutLoading === 'monthly' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>

            {/* Annual Tier */}
            <div className="bg-gray-900/50 p-8 rounded-xl border border-purple-900/30">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  $299<span className="text-xl text-gray-400">/yr</span>
                </div>
                <p className="text-green-400 font-medium">Save $180/year</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong className="text-white">60 code generations/year</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Lifetime template updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Early access to new features</span>
                </li>
              </ul>

              <button
                onClick={() => handleCheckout('yearly')}
                disabled={checkoutLoading === 'yearly'}
                className={`w-full py-3 rounded-lg font-medium transition border ${
                  checkoutLoading === 'yearly'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border-purple-900/30'
                }`}
              >
                {checkoutLoading === 'yearly' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Processing...
                  </>
                ) : (
                  'Get Annual'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 rounded-2xl p-12 border border-purple-900/30">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Get in Touch
              </h2>
              <p className="text-gray-300 text-lg">
                Have questions? We're here to help you build your SaaS.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📧</span>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Email</div>
                        <a href="mailto:support@codelaunch.ai" className="text-purple-400 hover:text-purple-300 font-medium">
                          support@codelaunch.ai
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⚡</span>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Response Time</div>
                        <div className="text-white font-medium">Within 24 hours</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💬</span>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Support</div>
                        <div className="text-white font-medium">Technical & Sales</div>
                      </div>
                    </div>
                  </div>
        </div>

                <div className="pt-6 border-t border-purple-900/30">
          <p className="text-gray-400 text-sm">
                    For urgent issues or enterprise inquiries, please email us directly at{' '}
                    <a href="mailto:support@codelaunch.ai" className="text-purple-400 hover:text-purple-300">
                      support@codelaunch.ai
                    </a>
                  </p>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-purple-900/30"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-purple-900/30"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-purple-900/30 resize-none"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-600/30"
                  >
                    Send Message
                  </button>

                  <p className="text-gray-500 text-xs text-center">
                    Or email us directly at support@codelaunch.ai
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-purple-900/30">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🚀</span>
                  <span className="text-xl font-bold text-white">
                    Code<span className="text-purple-400">Launch</span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  Ship your SaaS faster with AI-powered code generation.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#features" className="hover:text-purple-400 transition">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-purple-400 transition">Pricing</Link></li>
                  {isSignedIn && hasCompletedOnboarding && (
                    <li><Link href="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link></li>
                  )}
                  {isSignedIn && !hasCompletedOnboarding && (
                    <li><Link href="/onboarding" className="hover:text-purple-400 transition">Complete Setup</Link></li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#how-it-works" className="hover:text-purple-400 transition">How It Works</a></li>
                  <li><a href="#contact" className="hover:text-purple-400 transition">Contact</a></li>
                  <li><a href="mailto:support@codelaunch.ai" className="hover:text-purple-400 transition">support@codelaunch.ai</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-purple-400 transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Terms</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-purple-900/30 text-center text-gray-400 text-sm">
              © 2025 CodeLaunch. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
