import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const PricingPageClient = dynamic(() => import('./PricingPageClient'), {
  ssr: false,
});

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PricingPageClient />
    </Suspense>
  );
}
