'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SpaceBackground } from '@/components/ui/space-background';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Check onboarding status
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/user/onboarding-status');
        const result = await response.json();
        
        if (result.onboardingCompleted) {
          setOnboardingCompleted(true);
          router.push('/dashboard');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isLoaded, router]);

  if (!isLoaded || isChecking) {
    return (
      <SpaceBackground variant="default">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Loading...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  if (onboardingCompleted) {
    return null; // Will redirect
  }

  return (
    <SpaceBackground variant="default">
      <div className="min-h-screen">
        <OnboardingFlow />
      </div>
    </SpaceBackground>
  );
}

