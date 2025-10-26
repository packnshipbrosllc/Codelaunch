'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, Lock } from 'lucide-react';
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

      const response = await fetch('/api/stripe/create-checkout', {
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
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Required Subscription Notice */}
        {isRedirected && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6 flex items-start gap-4">
              <Lock className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Founder's Pricing - Limited Time</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Join as a founder and lock in this special pricing forever. No contracts, cancel anytime.
          </p>
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
              className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save $179
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <div
            className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border transition-all ${
              billingInterval === 'monthly'
                ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                : 'border-slate-700 opacity-60'
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly Founder</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$39.99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 mt-2">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                '100 AI generation credits/month',
                'Full access to all 10 stages',
                'AI-powered mindmaps & PRDs',
                'Code generation & export',
                'Priority support',
                'All future updates included',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly' || billingInterval !== 'monthly'}
              className={`w-full py-4 rounded-lg font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading === 'monthly' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Get Started'
              )}
            </button>
          </div>

          {/* Yearly Plan */}
          <div
            className={`relative bg-gradient-to-br from-purple-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border transition-all ${
              billingInterval === 'yearly'
                ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                : 'border-slate-700 opacity-60'
            }`}
          >
            {billingInterval === 'yearly' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Best Value
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Yearly Founder</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$299.99</span>
                <span className="text-slate-400">/year</span>
              </div>
              <p className="text-green-400 mt-2 font-medium">Save $179.89 compared to monthly</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                '1,200 AI generation credits/year',
                'Full access to all 10 stages',
                'AI-powered mindmaps & PRDs',
                'Code generation & export',
                'Priority support',
                'All future updates included',
                '2 months free (14 months total)',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading === 'yearly' || billingInterval !== 'yearly'}
              className={`w-full py-4 rounded-lg font-semibold transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading === 'yearly' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>

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
    </div>
  );
}

