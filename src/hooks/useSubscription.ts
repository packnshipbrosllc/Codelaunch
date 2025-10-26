import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function useSubscription() {
  const { user, isLoaded } = useUser();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-subscription', {
          headers: {
            'x-user-id': user.id,
          },
        });

        if (response.ok) {
          const { hasSubscription } = await response.json();
          setHasSubscription(hasSubscription);
        } else {
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [user, isLoaded]);

  return { hasSubscription, isLoading };
}

