// app/user-profile/[[...user-profile]]/page.tsx
import { UserProfile } from '@clerk/nextjs';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { CreditCard } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <div className="flex justify-center items-center min-h-screen py-12 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="w-full max-w-4xl">
        <UserProfile
          path="/user-profile"
          routing="path"
        >
          {/* Add custom Subscription page to Clerk's UserProfile */}
          <UserProfile.Page
            label="Subscription"
            labelIcon={<CreditCard className="w-4 h-4" />}
            url="subscription"
          >
            <div className="px-2">
              <h2 className="text-2xl font-bold mb-2 text-white">Subscription & Billing</h2>
              <p className="text-gray-300 mb-6">
                Manage your subscription, billing, and payment methods
              </p>
              <SubscriptionManagement />
            </div>
          </UserProfile.Page>

          {/* Keep default pages - Account and Security */}
          <UserProfile.Page label="account" />
          <UserProfile.Page label="security" />
        </UserProfile>
      </div>
    </div>
  );
}

