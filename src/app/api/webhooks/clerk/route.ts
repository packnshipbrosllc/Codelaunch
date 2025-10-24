import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { syncUserToSupabase, deleteUserFromSupabase } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing required svix headers');
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`Webhook received: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        try {
          await syncUserToSupabase(evt.data);
          console.log('User created successfully:', evt.data.id);
        } catch (error) {
          console.error('Failed to create user:', error);
          return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
          );
        }
        break;

      case 'user.updated':
        try {
          await syncUserToSupabase(evt.data);
          console.log('User updated successfully:', evt.data.id);
        } catch (error) {
          console.error('Failed to update user:', error);
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          );
        }
        break;

      case 'user.deleted':
        try {
          await deleteUserFromSupabase(evt.data.id!);
          console.log('User deleted successfully:', evt.data.id);
        } catch (error) {
          console.error('Failed to delete user:', error);
          return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
          );
        }
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
