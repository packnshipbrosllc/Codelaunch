// app/user-profile/[[...user-profile]]/page.tsx
import { UserProfile } from '@clerk/nextjs';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* User Profile */}
      <div className="flex justify-center items-center">
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
    </div>
  );
}

