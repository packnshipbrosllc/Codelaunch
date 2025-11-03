# 🚀 CodeLaunch - Direct Stripe Checkout & Free Mindmap Limit Implementation

## ✅ What's Been Implemented

This update adds:
- ✅ Direct Stripe checkout from the landing page (no more redirect to old pricing page)
- ✅ 3 free mindmap limit for non-subscribers
- ✅ `mindmaps_created` counter that can't be gamed by deleting mindmaps
- ✅ Frontend usage tracking with React hooks and banner components

## 📦 Files Created/Updated

1. **001_add_mindmaps_created.sql** - Database migration
2. **src/app/page.tsx** - Updated landing page with direct Stripe checkout
3. **src/app/api/save-mindmap/route.ts** - Updated API route with limit enforcement
4. **src/hooks/useMindmapLimit.ts** - React hook for checking limits
5. **src/components/MindmapLimitBanner.tsx** - UI component showing remaining mindmaps
6. **src/app/api/user/usage/route.ts** - API endpoint for fetching user usage
7. **src/app/create/page.tsx** - Updated with limit checks and error handling
8. **src/app/dashboard/page.tsx** - Added MindmapLimitBanner component

## 🔧 Implementation Steps

### Step 1: Run Database Migration ⚠️ REQUIRED

Open your Supabase SQL Editor and run:

```sql
-- Add mindmaps_created counter to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mindmaps_created INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_mindmaps_created ON users(mindmaps_created);

-- Update existing users to have 0 mindmaps created
UPDATE users 
SET mindmaps_created = 0 
WHERE mindmaps_created IS NULL;
```

**Verify it worked:**
```sql
SELECT id, subscription_status, mindmaps_created 
FROM users 
LIMIT 5;
```

### Step 2: Environment Variables Check

Make sure these exist in your `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxxxx
STRIPE_SECRET_KEY=sk_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🎯 Key Features

### 1. Direct Stripe Checkout
- Landing page pricing buttons now call Stripe API directly
- No redirect to `/pricing` page
- Loading states during checkout
- Automatic redirect to Stripe checkout page

### 2. Free Mindmap Limit (3 mindmaps)
- Counter stored in Supabase `users.mindmaps_created`
- Only increments, never decrements (can't game by deleting)
- Backend enforcement in `save-mindmap` API route
- Frontend checks with `useMindmapLimit` hook

### 3. User Experience
- Banner on dashboard showing remaining mindmaps
- Error messages when limit reached
- Upgrade prompts with direct links to pricing
- Automatic limit checking in create page

## 🧪 Testing Checklist

### Test Free Tier Limit:
- [ ] Sign up as new user
- [ ] Create 1st mindmap - should work, show "2 remaining"
- [ ] Create 2nd mindmap - should work, show "1 remaining"
- [ ] Create 3rd mindmap - should work, show "0 remaining" + upgrade banner
- [ ] Try to create 4th mindmap - should show error & upgrade prompt
- [ ] Try deleting a mindmap and creating another - should still be blocked (counter doesn't decrement)

### Test Direct Stripe Checkout:
- [ ] Click "Get Started" on Pro plan - should go directly to Stripe checkout
- [ ] Click "Get Annual" on Annual plan - should go directly to Stripe checkout
- [ ] If not signed in, should prompt to sign up first
- [ ] After payment, should redirect back to dashboard
- [ ] After subscribing, should see unlimited mindmap creation

### Test Subscription Flow:
- [ ] Subscribe to Pro plan
- [ ] Verify `subscription_status = 'active'` in Supabase users table
- [ ] Verify limit banner disappears
- [ ] Verify can create unlimited mindmaps
- [ ] Cancel subscription (via user profile)
- [ ] Verify `subscription_status = 'canceled'`
- [ ] Verify free limit re-applies after cancellation

## 🔒 Security Notes

The `mindmaps_created` counter is secure because:
- ✅ Stored server-side in Supabase (users can't manipulate it)
- ✅ Only increments, never decrements (deleting mindmaps doesn't reset it)
- ✅ Checks happen on the backend API route, not client-side
- ✅ Uses Supabase Service Role Key to bypass RLS for admin operations

## 🎨 Customization Options

### Change Free Mindmap Limit:
In `src/app/api/save-mindmap/route.ts`, change line:
```typescript
const FREE_MINDMAP_LIMIT = 3;  // Change 3 to your desired limit
```
Also update in `src/hooks/useMindmapLimit.ts`:
```typescript
freeLimit: 3,  // Change 3 to match
```

### Change Pricing:
Update values in `src/lib/stripe.ts`:
```typescript
export const PRICING = {
  monthly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
    amount: 39.99,  // Change this
    // ...
  },
  yearly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
    amount: 299.99,  // Change this
    // ...
  },
};
```

## 🐛 Troubleshooting

### "Unauthorized" when creating mindmap:
- Check Clerk authentication is working
- Verify user is signed in

### "Failed to create user profile":
- Check Supabase Service Role Key is set correctly
- Verify users table exists and has correct columns

### Mindmap limit not enforcing:
- Check database migration ran successfully
- Verify `mindmaps_created` column exists: `SELECT mindmaps_created FROM users LIMIT 1;`
- Check API route is using updated code

### Stripe checkout not working:
- Verify price IDs are correct in `.env.local`
- Check Stripe webhook is configured (for subscription status updates)
- Test with Stripe test mode first

### Counter not incrementing:
- Check Supabase logs for errors
- Verify Service Role Key has permissions
- Test with: `UPDATE users SET mindmaps_created = mindmaps_created + 1 WHERE id = 'your-user-id';`

## 📞 Support

If you encounter issues:
1. Check console logs (browser + server)
2. Check Supabase logs
3. Verify all environment variables are set
4. Test with Stripe test mode first

## ✅ Next Steps

After implementing this:
1. Run the database migration in Supabase
2. Test the entire flow with real Stripe test cards
3. Set up Stripe webhooks to handle subscription status changes
4. Monitor users hitting the free limit and conversion to paid

## 🎉 You're Done!

Your CodeLaunch app now has:
- ✅ Direct Stripe checkout from homepage
- ✅ 3 free mindmap limit that can't be gamed
- ✅ Smooth upgrade flow for users
- ✅ Professional usage tracking

Users will have a much better experience going straight to Stripe checkout instead of the old two-step process! 🚀

