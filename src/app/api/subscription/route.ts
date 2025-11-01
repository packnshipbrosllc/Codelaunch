// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status, subscription_plan')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        tier: 'FREE',
        status: 'inactive',
        details: null 
      });
    }

    // If user has a subscription, get details from Stripe
    let subscriptionDetails = null;
    if (user.stripe_customer_id) {
      try {
        // Get customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          const item = subscription.items.data[0];
          
          // These properties exist at runtime but TypeScript types are outdated
          // @ts-expect-error - Stripe types are incorrect, properties exist in API response
          const currentPeriodEnd: number = subscription.current_period_end;
          // @ts-expect-error - Stripe types are incorrect
          const cancelAtPeriodEnd: boolean = subscription.cancel_at_period_end;
          // @ts-expect-error - Stripe types are incorrect
          const cancelAt: number | null = subscription.cancel_at;
          
          // Extract price information - Stripe uses Price objects in modern API
          const price = item?.price;
          const amount = price?.unit_amount ?? 0;
          const currency = price?.currency ?? 'usd';
          const interval = price?.recurring?.interval ?? 'month';
          
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd,
            cancelAtPeriodEnd,
            cancelAt,
            tier: user.subscription_plan || 'monthly',
            amount: amount,
            currency: currency,
            interval: interval,
          };
        }
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
      }
    }

    return NextResponse.json({
      tier: user.subscription_plan || 'FREE',
      status: user.subscription_status || 'inactive',
      details: subscriptionDetails
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
