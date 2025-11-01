// app/api/stripe/customer-portal/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createPortalSession } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 404 }
      );
    }

    // Create a Stripe customer portal session
    const portalSession = await createPortalSession(
      user.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

