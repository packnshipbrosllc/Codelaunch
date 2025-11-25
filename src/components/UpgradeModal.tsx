// Upgrade Modal Component with Space Theme
// Location: src/components/UpgradeModal.tsx

'use client';

import { X, Lock, Sparkles, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PRICING } from '@/lib/stripe';
import { trackPaywallViewed, trackUpgradeClicked, trackCheckoutStarted } from '@/utils/analytics';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  // Handle keyboard shortcuts and track modal view
  useEffect(() => {
    if (!isOpen) return;

    // Track when paywall modal is viewed
    trackPaywallViewed('upgrade_modal', featureName || 'general');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, featureName]);

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const plan = PRICING[selectedPlan];
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          plan: selectedPlan,
        }),
      });

      // Validate response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: Failed to create checkout session`);
      }

      const data = await response.json();
      
      if (data.url) {
        // Track ONLY after successful checkout session creation
        // AWAIT these to ensure events are sent before redirect
        await trackUpgradeClicked('upgrade_modal', selectedPlan);
        await trackCheckoutStarted(selectedPlan, plan.amount);
        
        // Redirect to Stripe checkout (only after tracking completes)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      setError(error.message || 'Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  const proFeatures = [
    { icon: '📄', text: 'Generate Comprehensive PRDs' },
    { icon: '💻', text: 'Generate Production Code' },
    { icon: '🚀', text: 'Unlimited Mindmaps' },
    { icon: '📦', text: 'Export to Cursor & VS Code' },
    { icon: '🔒', text: 'Priority Support' },
    { icon: '✨', text: 'Early Access to New Features' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 via-purple-900/90 to-black/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Space Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
            {/* Animated stars */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30 bg-gray-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                    Upgrade to Pro
                  </h2>
                  {featureName && (
                    <p className="text-gray-300">
                      Unlock <span className="text-purple-400 font-semibold">{featureName}</span> and all Pro features
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  disabled={isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  disabled={isLoading}
                  className={`relative p-6 rounded-xl border-2 transition-all transform ${
                    selectedPlan === 'monthly'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 scale-105'
                      : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedPlan === 'monthly' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SELECTED
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ${PRICING.monthly.amount}
                      </span>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {PRICING.monthly.credits} credits/month
                    </p>
                  </div>
                </button>

                {/* Yearly Plan */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  disabled={isLoading}
                  className={`relative p-6 rounded-xl border-2 transition-all transform ${
                    selectedPlan === 'yearly'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 scale-105'
                      : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:scale-[1.02]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedPlan === 'yearly' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SELECTED
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                        BEST VALUE
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Yearly</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ${PRICING.yearly.amount}
                      </span>
                      <span className="text-gray-400 text-sm">/year</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">
                      {PRICING.yearly.credits} credits/year
                    </p>
                    <p className="text-green-400 text-xs font-semibold">
                      Save ${PRICING.yearly.savings} per year
                    </p>
                  </div>
                </button>
              </div>

              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <p className="text-center text-white text-sm">
                  <span className="font-semibold text-blue-300">💡 Developers save 4+ hours per project</span>
                  <span className="text-gray-300"> with automated PRD generation and production-ready code</span>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-semibold mb-1">Checkout Failed</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Pro Features List */}
              <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Everything in Pro:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature.icon} {feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating checkout session...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Upgrade to Pro - ${PRICING[selectedPlan].amount}/{selectedPlan === 'monthly' ? 'mo' : 'yr'}</span>
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <p className="text-center text-gray-400 text-xs mt-4">
                🔒 Secure checkout powered by Stripe • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
