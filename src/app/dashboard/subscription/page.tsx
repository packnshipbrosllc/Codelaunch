// src/app/dashboard/subscription/page.tsx
// Professional subscription management page

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface SubscriptionDetails {
  id: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelAt: number | null;
  tier: string;
  amount: number;
  currency: string;
  interval: string;
}

interface SubscriptionData {
  tier: string;
  status: string;
  details: SubscriptionDetails | null;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Failed to open subscription management portal');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('An error occurred');
    } finally {
      setManagingSubscription(false);
    }
  };

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Date not available';
    }
    
    try {
      const date = new Date(timestamp * 1000);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Subscription & Billing</h1>
              <p className="text-gray-300 mt-2">Manage your subscription, payment methods, and billing history</p>
            </div>
            {subscription?.tier && subscription.tier !== 'FREE' && subscription.status !== 'inactive' && (
              <button
                onClick={handleManageSubscription}
                disabled={managingSubscription}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg"
              >
                {managingSubscription ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Manage Subscription
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subscription?.tier === 'FREE' || !subscription?.tier || subscription?.status === 'inactive' ? (
          // No Subscription State
          <div className="bg-gray-800/50 rounded-xl shadow-xl border border-purple-500/20 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Active Subscription</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Subscribe to CodeLaunch to unlock all features and start building your SaaS product today.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors font-medium shadow-lg">
                View Pricing Plans
              </button>
            </Link>
          </div>
        ) : (
          // Active Subscription
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-gray-800/50 rounded-xl shadow-xl border border-purple-500/20 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Current Plan</p>
                    <h2 className="text-3xl font-bold">
                      {subscription.tier === 'monthly' ? 'Monthly Founder' : 'Yearly Founder'} Plan
                    </h2>
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        subscription.details?.status === 'active' && !subscription.details?.cancelAtPeriodEnd
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : subscription.details?.cancelAtPeriodEnd
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {subscription.details?.cancelAtPeriodEnd ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Canceling at period end
                          </>
                        ) : subscription.details?.status === 'active' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {subscription.details?.status}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  {subscription.details && (
                    <div className="text-right">
                      <p className="text-5xl font-bold">
                        {formatAmount(subscription.details.amount, subscription.details.currency)}
                      </p>
                      <p className="text-purple-100 mt-1">
                        per {subscription.details.interval}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Info */}
              {subscription.details && (
                <div className="px-6 py-6 space-y-4">
                  {/* Next Billing Date */}
                  <div className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">
                        {subscription.details.cancelAtPeriodEnd ? 'Subscription Ends' : 'Next Billing Date'}
                      </p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {formatDate(subscription.details.currentPeriodEnd)}
                      </p>
                      {!subscription.details.cancelAtPeriodEnd && (
                        <p className="text-sm text-gray-300 mt-1">
                          You'll be charged {formatAmount(subscription.details.amount, subscription.details.currency)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Warning */}
                  {subscription.details.cancelAtPeriodEnd && (
                    <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-300">
                          Your subscription will be canceled
                        </p>
                        <p className="text-sm text-amber-200 mt-1">
                          You'll have access to all features until {formatDate(subscription.details.currentPeriodEnd)}. 
                          After that, your account will revert to the free tier.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-800/50 rounded-xl shadow-xl border border-purple-500/20 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What You Can Manage</h3>
              
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-white mb-3">Click "Manage Subscription" above to:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Cancel your subscription
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Resume canceled subscription
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Update payment methods
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    View and download invoices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Update billing information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Change subscription plan (monthly ↔ annual)
                  </li>
                </ul>
              </div>
            </div>

            {/* Code Ownership Reminder */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">You Own 100% of Your Code</h3>
                  <p className="text-gray-300 text-sm">
                    All code you download is yours to keep forever. If you cancel, you retain full ownership 
                    and can continue using everything you've downloaded. No restrictions, no royalties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
