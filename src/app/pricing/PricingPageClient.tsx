'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PricingPageClient() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRedirected = searchParams.get('redirect') === 'true';

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/pricing');
      return;
    }

    setLoading(plan);

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
        redirect: 'follow',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const originalMonthlyPrice = 99;
  const originalYearlyPrice = 990;
  const monthlyPrice = 39.99;
  const yearlyPrice = 299.99;
  const yearlySavings = originalYearlyPrice - yearlyPrice; // $690.01

  const allFeatures = [
    'Complete Next.js 15 starter template',
    'Authentication with Clerk',
    'Stripe payment integration',
    'Database setup (Supabase + PostgreSQL)',
    'Advanced UI component library',
    'Admin dashboard template',
    'User management system',
    'Subscription management UI',
    'AI-powered mindmap generation',
    'PRD generation',
    'Code generation & export',
    'Email templates',
    'Priority email support',
    '100% code ownership',
    'Deploy anywhere',
    'Lifetime updates',
    'Unlimited projects',
    'Unlimited developer licenses',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Required Subscription Notice */}
        {isRedirected && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6 flex items-start gap-4">
              <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Subscription Required</h3>
                <p className="text-slate-300 text-sm">
                  To access CodeLaunch and start building your app, please select a plan below. 
                  You can cancel anytime!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/50 mb-6 animate-pulse">
            <span className="text-2xl">🔥</span>
            <span className="text-sm text-red-300 font-bold">LIMITED TIME</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Founder's Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-6">
            Lock in lifetime founder pricing at <span className="font-bold text-purple-400">$39.99/month</span> or <span className="font-bold text-purple-400">$299.99/year</span> before prices increase.
          </p>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-green-300">
              <Shield className="w-5 h-5" />
              <p className="font-medium">
                Own your code 100% • Cancel anytime • Keep everything you've downloaded
              </p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 relative ${
                billingInterval === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                Save 70%
              </span>
            </button>
          </div>
        </div>

        {/* Single Large Card Layout */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-slate-800/80 to-purple-900/40 backdrop-blur-sm rounded-3xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 overflow-hidden">
            {/* LIMITED TIME Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg">
                <span>🔥</span>
                <span>LIMITED TIME</span>
                <span>🔥</span>
              </div>
            </div>

            <div className="p-8 md:p-12 pt-16">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Column - Pricing */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-14 h-14 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-white">Founder's Plan</h2>
                      <p className="text-purple-300 text-sm">Lock in forever</p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  {billingInterval === 'monthly' ? (
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-gray-500 line-through text-3xl">
                          ${originalMonthlyPrice}
                        </span>
                        <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          ${monthlyPrice}
                        </span>
                        <span className="text-gray-400 text-xl">/month</span>
                      </div>
                      <div className="text-green-400 font-semibold mb-2">
                        Save ${(originalMonthlyPrice - monthlyPrice).toFixed(2)}/month • Lock in this rate forever!
                      </div>
                      <div className="text-gray-400 text-sm">
                        Billed monthly • Cancel anytime • Keep your code
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-gray-500 line-through text-3xl">
                          ${originalYearlyPrice}
                        </span>
                        <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          ${yearlyPrice}
                        </span>
                        <span className="text-gray-400 text-xl">/year</span>
                      </div>
                      <div className="text-green-400 font-bold text-lg mb-2">
                        Save ${yearlySavings.toFixed(2)} with annual billing!
                      </div>
                      <div className="text-gray-400 text-sm mb-3">
                        Just ${(yearlyPrice / 12).toFixed(2)}/month • Billed annually
                      </div>
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                        <p className="text-sm text-green-300 font-medium">
                          💰 You save ${yearlySavings.toFixed(2)} compared to regular pricing
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(billingInterval)}
                    disabled={loading === billingInterval}
                    className={`w-full py-5 px-6 rounded-lg font-bold text-lg transition-all mb-4 flex items-center justify-center gap-2 ${
                      loading === billingInterval
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading === billingInterval ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Lock In Founder Pricing
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Urgency Message */}
                  <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
                    <p className="text-sm text-amber-300">
                      <span className="font-bold">⚡ Price increases soon!</span> Lock in founder pricing now and keep it forever.
                    </p>
                  </div>
                </div>

                {/* Right Column - Features */}
                <div>
                  <h3 className="font-bold text-white mb-6 text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Everything Included:
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {allFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Do I really own 100% of the code?
              </h3>
              <p className="text-gray-300">
                Yes! Once you subscribe, you download the complete source code. It's yours forever. 
                You can modify it, use it in unlimited projects, and even sell products built with it. 
                No restrictions, no royalties, complete ownership.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if I cancel my subscription?
              </h3>
              <p className="text-gray-300">
                You keep everything you've downloaded. Your code remains yours forever. You just won't 
                receive new updates or support after cancellation. You can resubscribe anytime to get 
                access to updates again.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I use this for multiple projects?
              </h3>
              <p className="text-gray-300">
                Absolutely! Use it for as many projects as you want. The only limit is the number of 
                developers who can access the source code (based on your plan's developer licenses).
              </p>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-400 text-sm flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              🔒 Secure payment processing by Stripe
            </span>
            <span className="flex items-center gap-2">
              💳 All major credit cards accepted
            </span>
            <span className="flex items-center gap-2">
              ✨ Cancel anytime
            </span>
          </p>
          <p className="text-slate-500 text-xs">
            *Plus applicable taxes based on your location
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}
