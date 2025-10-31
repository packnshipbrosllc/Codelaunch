// Alternative: Add to UserButton dropdown (modal version)
// components/UserButtonWithSubscription.tsx
'use client';

import { UserButton } from '@clerk/nextjs';
import SubscriptionManagement from './SubscriptionManagement';
import { CreditCard } from 'lucide-react';

export default function UserButtonWithSubscription() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10',
        },
      }}
    >
      {/* Add Subscription page to the UserButton dropdown menu */}
      <UserButton.UserProfilePage
        label="Subscription"
        labelIcon={<CreditCard className="w-4 h-4" />}
        url="subscription"
      >
        <div className="p-6 bg-gray-900">
          <h2 className="text-2xl font-bold mb-2 text-white">Subscription & Billing</h2>
          <p className="text-gray-300 mb-6">
            Manage your subscription, billing, and payment methods
          </p>
          <SubscriptionManagement />
        </div>
      </UserButton.UserProfilePage>
    </UserButton>
  );
}

