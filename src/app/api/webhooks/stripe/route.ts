import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('🔔 WEBHOOK RECEIVED - Starting processing');
  
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  console.log('📧 Signature exists:', !!signature);
  console.log('📦 Body length:', body.length);

  if (!signature) {
    console.error('❌ No signature found');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Event verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  console.log('🎯 Processing event type:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('💳 Processing checkout.session.completed');
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        console.log('👤 User ID from session:', userId);
        console.log('📧 Customer email:', session.customer_email);

        if (userId) {
          console.log('🔍 About to update Supabase for user ID:', userId);
          
          const { data, error } = await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              subscription_plan: session.metadata?.plan || 'monthly',
              subscription_started_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select(); // Returns the updated row
          
          console.log('📊 Supabase response data:', JSON.stringify(data, null, 2));
          console.log('❌ Supabase error:', error);
          console.log('🔢 Rows updated:', data?.length || 0);
          
          if (error) {
            console.error('❌ Supabase update error details:', JSON.stringify(error, null, 2));
          }
          
          console.log('✅ Supabase update completed for user:', userId);
        } else {
          console.warn('⚠️ No user ID found in session metadata');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_plan: subscription.items.data[0]?.price.metadata?.plan || 'monthly',
            })
            .eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'inactive',
            })
            .eq('id', user.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          // Refresh credits on successful payment
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
            })
            .eq('id', user.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', user.id);
        }
        break;
      }
    }

    console.log('✅ Webhook processing completed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

