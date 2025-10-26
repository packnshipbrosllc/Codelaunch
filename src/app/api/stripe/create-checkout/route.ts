import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createCheckoutSession, PRICING } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe checkout endpoint. Use POST to create session.' 
  });
}

// POST to create checkout session
export async function POST(request: Request) {
  console.log('🚀 Creating checkout session...');
  
  try {
    // Authenticate
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No user ID');
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();
    const { priceId, plan } = body;
    
    console.log('📝 Plan:', plan, 'Price ID:', priceId);

    // Validate plan
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      console.log('❌ Invalid plan');
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Validate price ID
    const expectedPriceId = PRICING[plan].priceId;
    if (priceId !== expectedPriceId) {
      console.log('❌ Price ID mismatch');
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get user email
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      console.log('❌ No email found');
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    console.log('✅ Creating session for:', userEmail);

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      priceId,
      userId,
      userEmail,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    console.log('✅ Session created:', session.sessionId);

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
