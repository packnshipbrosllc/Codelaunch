import SubscriptionManagement from '@/components/SubscriptionManagement';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800/50 rounded-2xl shadow-xl border border-purple-500/20 backdrop-blur-sm p-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Subscription & Billing</h1>
          <p className="text-gray-300 mb-8">
            Manage your subscription, billing, and payment methods
          </p>
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
}

