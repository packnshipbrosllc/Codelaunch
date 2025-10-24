import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      const { error } = await supabaseAdmin.from('users').insert({
        id: id,
        email: email_addresses[0]?.email_address || '',
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error: Failed to create user', { status: 500 });
      }

      console.log('✅ User created in Supabase:', id);
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error: Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          email: email_addresses[0]?.email_address || '',
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error: Failed to update user', { status: 500 });
      }

      console.log('✅ User updated in Supabase:', id);
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error: Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error: Failed to delete user', { status: 500 });
      }

      console.log('✅ User deleted from Supabase:', id);
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error: Internal server error', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}