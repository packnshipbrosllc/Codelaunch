import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('✅ POST endpoint hit');
  
  try {
    // Import auth inside the function
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { stripe } = await import('@/lib/stripe');
    
    // Get user
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get body
    const body = await request.json();
    const { priceId, plan } = body;
    console.log('Plan:', plan, 'Price ID:', priceId);

    // Validate
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get user email
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    console.log('Creating session for:', userEmail);

    // Create session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    console.log('Session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
