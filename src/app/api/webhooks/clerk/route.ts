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
  console.log('🎯 Webhook received:', eventType);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Debug logging
    console.log('🔍 User ID:', id);
    console.log('📧 Email:', email_addresses[0]?.email_address);
    console.log('👤 Name:', first_name, last_name);

    try {
      const userData = {
        id: id,
        email: email_addresses[0]?.email_address || '',
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Inserting user data:', JSON.stringify(userData, null, 2));

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select();

      console.log('📊 Supabase response - data:', data);
      console.log('📊 Supabase response - error:', error);

      if (error) {
        console.error('❌ Supabase error:', JSON.stringify(error, null, 2));
        return new Response(JSON.stringify({ error: 'Failed to create user', details: error }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ User created successfully in Supabase:', id);
      return new Response(JSON.stringify({ success: true, user: data }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('❌ Exception in user.created:', error);
      return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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