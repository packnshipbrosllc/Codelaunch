import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/stripe',
  '/api/webhooks/clerk',
  '/api/check-subscription',
  '/api/stripe/create-checkout',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - require authentication
  const { userId } = await auth();
  
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check onboarding status for authenticated users
  const url = new URL(req.url);
  const isOnboardingRoute = url.pathname === '/onboarding';
  
  // If user is on onboarding route, allow through
  if (isOnboardingRoute) {
    return NextResponse.next();
  }

  // Allow onboarding API routes to be accessed (needed for checking status)
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/user/onboarding')) {
    return NextResponse.next();
  }

  // For all other routes, check onboarding status
  try {
    const onboardingStatusUrl = new URL('/api/user/onboarding-status', req.url);
    const response = await fetch(onboardingStatusUrl, {
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // If onboarding not completed, redirect to onboarding
      if (!data.completed) {
        const onboardingUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  } catch (error) {
    console.error('Error checking onboarding status in middleware:', error);
    // On error, allow through to avoid blocking users
  }

  // ✅ FREE TIER ENABLED: Allow all authenticated users to access the app
  // The API will enforce the 3-mindmap limit when users try to save
  // Users can use the app for FREE until they hit the limit
  
  // Allow access to all routes for authenticated users
  // Subscription checks happen in the API routes, not middleware
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
