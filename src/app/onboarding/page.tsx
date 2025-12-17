// FILE PATH: src/app/onboarding/page.tsx
// Main onboarding page for first-time users

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/user/onboarding-status');
        const data = await response.json();
        
        // If onboarding is already completed, redirect to dashboard
        if (data.completed) {
          router.push('/dashboard');
        } else {
          setIsCheckingStatus(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [isLoaded, user, router]);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <OnboardingFlow />
      </div>
  );
}
