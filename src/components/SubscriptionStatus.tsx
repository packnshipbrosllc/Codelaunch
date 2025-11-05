'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { CreditCard, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionStatus() {
  const { hasSubscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-48"></div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">No Active Subscription</h3>
              <p className="text-slate-300 text-sm">Subscribe to unlock all features</p>
            </div>
          </div>
          <Link
            href="/#pricing"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              Active Subscription
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Founder
              </span>
            </h3>
            <p className="text-slate-300 text-sm">All features unlocked</p>
          </div>
        </div>
        <button
          onClick={async () => {
            const res = await fetch('/api/stripe/create-portal', { method: 'POST' });
            const { url } = await res.json();
            window.location.href = url;
          }}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Manage
        </button>
      </div>
    </div>
  );
}

