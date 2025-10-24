# 🚀 CodeLaunch Clerk Webhook Setup Guide

## ✅ What's Already Done

Your webhook system is now implemented! Here's what I've created:

### 📁 Files Created:
- `src/lib/supabase-admin.ts` - Admin client for server-side Supabase operations
- `src/app/api/webhooks/clerk/route.ts` - Complete webhook handler
- `svix` package installed for webhook verification

### 🔧 What the Webhook Does:
- **User Created**: Automatically creates user in Supabase when they sign up
- **User Updated**: Syncs profile changes from Clerk to Supabase
- **User Deleted**: Removes user and all related data (projects, mindmaps, PRDs, usage tracking)

## 🔑 Required Environment Variables

Add these to your `.env.local` file:

```bash
# Clerk Webhook Secret (get this from Clerk Dashboard after creating webhook)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Service Role Key (get this from Supabase Dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📋 Setup Steps

### 1. Get Supabase Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (not the anon key)
5. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create Clerk Webhook
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Set the **Endpoint URL** to: `https://yourdomain.com/api/webhooks/clerk`
   - For local testing: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
6. Select these events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)
9. Add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

### 3. Test the Webhook

#### Option A: Local Testing with ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
```

#### Option B: Deploy to Production
Deploy your app to Vercel/Netlify and use the production URL in Clerk webhook settings.

### 4. Verify It's Working
1. Create a new user account in your app
2. Check your Supabase `users` table - you should see the new user
3. Update the user's profile in Clerk
4. Check Supabase - the user record should be updated
5. Delete the user account
6. Check Supabase - the user and all related data should be deleted

## 🗄️ Database Schema

Your existing tables are perfect! The webhook will work with:

```sql
-- users table (already exists)
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Related tables (already exist)
-- projects, mindmaps, prds, usage_tracking
```

## 🔍 Troubleshooting

### Common Issues:
1. **Webhook not firing**: Check the endpoint URL is correct
2. **Signature verification failed**: Ensure `CLERK_WEBHOOK_SECRET` is correct
3. **Database errors**: Verify `SUPABASE_SERVICE_ROLE_KEY` has proper permissions
4. **CORS errors**: Make sure your domain is whitelisted in Clerk

### Debug Logs:
Check your terminal/server logs for webhook events:
```
Webhook received: user.created
User synced to Supabase: user_xxx
```

## 🎉 You're All Set!

Once configured, your webhook will automatically:
- ✅ Sync all new users to Supabase
- ✅ Keep user data updated across both systems  
- ✅ Clean up data when users delete their accounts
- ✅ Handle all edge cases with proper error handling

Your CodeLaunch app now has professional-grade user management! 🚀
