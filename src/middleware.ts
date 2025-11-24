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

// Define onboarding route
const isOnboardingRoute = createRouteMatcher(['/onboarding']);

// Define API routes that should bypass onboarding check
const isOnboardingApiRoute = createRouteMatcher([
  '/api/user/onboarding-status',
  '/api/user/complete-onboarding',
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

  // Allow onboarding route itself
  if (isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // Allow onboarding API routes
  if (isOnboardingApiRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, check onboarding status
  try {
    const onboardingStatusUrl = new URL('/api/user/onboarding-status', req.url);
    
    const response = await fetch(onboardingStatusUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // If onboarding not completed, redirect to onboarding
      // But only for NEW users (not existing users who never had onboarding)
      if (!data.completed && data.isNewUser) {
        const onboardingUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    } else {
      // If API call fails, log but allow through (don't block users)
      console.error('Onboarding status check failed:', response.status);
    }
  } catch (error) {
    // On error, allow through to avoid blocking users
    console.error('Error checking onboarding status in middleware:', error);
  }

  // Allow access to all routes for authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
