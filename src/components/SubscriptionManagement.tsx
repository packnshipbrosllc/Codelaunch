// components/SubscriptionManagement.tsx
'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Calendar, AlertCircle, Check } from 'lucide-react';

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

export default function SubscriptionManagement() {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-8 text-gray-400">
        Failed to load subscription information
      </div>
    );
  }

  if (subscription.tier === 'FREE' || subscription.status === 'inactive') {
    return (
      <div className="space-y-6 py-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Free Plan</h3>
              <p className="text-sm text-gray-300 mb-4">
                You're currently on the free plan. Upgrade to unlock premium features!
              </p>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors text-sm font-medium"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-white mb-2 text-sm">Free Plan Includes:</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Basic features
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Limited usage
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Community support
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {subscription.tier === 'monthly' ? 'Monthly Founder' : 'Yearly Founder'} Plan
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.details?.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {subscription.details?.status || subscription.status}
              </span>
            </div>
          </div>
          {subscription.details && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {formatAmount(subscription.details.amount, subscription.details.currency)}
              </p>
              <p className="text-sm text-gray-300">
                per {subscription.details.interval}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing Information */}
      {subscription.details && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-300">Next Billing Date</p>
              <p className="text-sm text-white font-semibold mt-0.5">
                {formatDate(subscription.details.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {subscription.details.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-300">
                  Subscription Ending
                </p>
                <p className="text-sm text-amber-200 mt-1">
                  Your subscription will be canceled on{' '}
                  {formatDate(subscription.details.currentPeriodEnd)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Button */}
      <button
        onClick={handleManageSubscription}
        disabled={managingSubscription}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg"
      >
        {managingSubscription ? 'Opening Portal...' : 'Manage Subscription'}
      </button>

      {/* What You Can Do */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="font-medium text-white mb-3 text-sm">
          What can I manage?
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Cancel or pause subscription
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Update payment methods
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            View billing history & invoices
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Change subscription plan
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Update billing information
          </li>
        </ul>
      </div>
    </div>
  );
}

