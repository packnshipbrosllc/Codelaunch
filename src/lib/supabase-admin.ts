import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to sync user data with Supabase
export async function syncUserToSupabase(userData: {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at: number;
  updated_at: number;
}) {
  try {
    const email = userData.email_addresses[0]?.email_address;
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userData.id,
        email: email,
        first_name: userData.first_name || null,
        last_name: userData.last_name || null,
        subscription_tier: 'free', // Default tier
        stripe_customer_id: null,
        created_at: new Date(userData.created_at).toISOString(),
        updated_at: new Date(userData.updated_at).toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      throw error;
    }

    console.log('User synced to Supabase:', userData.id);
    return data;
  } catch (error) {
    console.error('Failed to sync user:', error);
    throw error;
  }
}

// Helper function to delete user and all related data
export async function deleteUserFromSupabase(userId: string) {
  try {
    // Delete related data first (foreign key constraints)
    await supabaseAdmin.from('usage_tracking').delete().eq('user_id', userId);
    await supabaseAdmin.from('prds').delete().eq('user_id', userId);
    await supabaseAdmin.from('mindmaps').delete().eq('user_id', userId);
    await supabaseAdmin.from('projects').delete().eq('user_id', userId);
    
    // Finally delete the user
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      throw error;
    }

    console.log('User and all related data deleted:', userId);
    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}
