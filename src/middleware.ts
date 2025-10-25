import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
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

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
