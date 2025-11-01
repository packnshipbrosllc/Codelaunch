import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
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

  // Check if user has active subscription
  const path = req.nextUrl.pathname;
  
  try {
    const response = await fetch(
      `${req.nextUrl.origin}/api/check-subscription`,
      {
        headers: {
          'x-user-id': userId,
        },
      }
    );

    if (!response.ok) {
      // If check fails, allow through (fail open)
      return NextResponse.next();
    }

    const { hasSubscription } = await response.json();

    // Allow access to user profile (for subscription management) and pricing page
    const allowedPaths = ['/pricing', '/user-profile'];
    if (!hasSubscription && !allowedPaths.some(allowedPath => path.startsWith(allowedPath))) {
      const pricingUrl = new URL('/pricing', req.url);
      pricingUrl.searchParams.set('redirect', 'true');
      return NextResponse.redirect(pricingUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Subscription check error:', error);
    // Fail open - allow access if check fails
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
