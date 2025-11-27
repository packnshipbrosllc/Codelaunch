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
          const data = await response.json();
          const { hasSubscription } = data;
          
          // Debug logging
          console.log('🔒 useSubscription API Response:', {
            userId: user.id,
            response: data,
            hasSubscription,
            type: typeof hasSubscription,
          });
          
          setHasSubscription(hasSubscription);
        } else {
          console.warn('🔒 useSubscription API Error:', response.status, response.statusText);
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('🔒 Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [user, isLoaded]);

  return { hasSubscription, isLoading };
}

