import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  
  // Log to verify middleware is running
  console.log('🔍 Middleware checking path:', pathname);
  
  // Explicitly skip ALL webhook routes - no auth at all
  if (pathname.includes('/api/webhooks')) {
    console.log('✅ Skipping auth for webhook');
    return NextResponse.next();
  }

  // Skip auth for public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect route - check authentication
  if (!auth.userId) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check subscription for protected routes
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/check-subscription`, {
      headers: {
        'x-user-id': auth.userId,
      },
    });

    if (response.ok) {
      const { hasSubscription } = await response.json();
      
      if (!hasSubscription) {
        console.log('❌ No subscription - redirecting to pricing');
        const pricingUrl = new URL('/pricing', request.url);
        pricingUrl.searchParams.set('redirect', 'true');
        return NextResponse.redirect(pricingUrl);
      }
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    // If check fails, allow through (fail open)
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
