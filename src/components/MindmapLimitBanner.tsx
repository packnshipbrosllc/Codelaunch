'use client';

import { useMindmapLimit } from '@/hooks/useMindmapLimit';
import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';

export function MindmapLimitBanner() {
  const { canCreateMore, isSubscribed, remainingFreeMindmaps, mindmapsCreated, freeLimit } = useMindmapLimit();

  // Don't show banner for subscribers
  if (isSubscribed) {
    return null;
  }

  // Show limit reached banner
  if (!canCreateMore) {
    return (
      <div className="bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 border border-red-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Free Mindmap Limit Reached
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              You've used all {freeLimit} free mindmaps. Upgrade to Pro for unlimited mindmaps, PRDs, and code generation.
            </p>
            <Link href="/#pricing">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-medium transition text-sm">
                Upgrade to Pro →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show remaining mindmaps banner
  if (remainingFreeMindmaps !== null && remainingFreeMindmaps < freeLimit) {
    return (
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              {remainingFreeMindmaps} Free Mindmap{remainingFreeMindmaps !== 1 ? 's' : ''} Remaining
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              You've created {mindmapsCreated} of {freeLimit} free mindmaps. Upgrade to Pro for unlimited mindmaps and all features.
            </p>
            <Link href="/#pricing">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-medium transition text-sm">
                Upgrade Now →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if user has all free mindmaps remaining
  return null;
}

