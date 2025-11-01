# Stripe Customer Portal Configuration Guide

Your code is ready! Now you just need to configure the Stripe Customer Portal in your Stripe dashboard.

## Quick Setup Steps

### 1. Go to Stripe Portal Settings

**Test Mode:**
👉 https://dashboard.stripe.com/test/settings/billing/portal

**Live Mode (when ready):**
👉 https://dashboard.stripe.com/settings/billing/portal

### 2. Enable Features

#### ✅ Subscriptions Section
- [x] **Allow customers to cancel subscriptions**
- [x] **Allow customers to switch plans**
- **Cancellation behavior:** Choose **"Cancel at the end of the billing period"** ⭐ RECOMMENDED
  - Users keep access until current period ends
  - Less frustrating experience
  - Can reactivate before expiration

#### ✅ Payment Methods Section
- [x] **Allow customers to update their payment methods**
  - Users can change credit cards

#### ✅ Invoices Section
- [x] **Allow customers to view invoice history**
  - Users can download past invoices

#### ✅ Customer Information Section
- [x] **Allow customers to update billing email**
- [x] **Allow customers to update billing address**

### 3. Configure Products (Important!)

For each subscription product ($39.99/month and $299.99/year):

1. Go to: https://dashboard.stripe.com/test/products
2. Click on each product
3. Click **"Additional options"**
4. Ensure:
   - ✅ Customers can switch to other prices
   - ✅ Customers can cancel (if enabled)

### 4. Save Configuration

Click **"Save"** at the bottom of the Portal Settings page.

### 5. Test It

1. Go to `/dashboard/subscription` in your app
2. Click **"Manage Subscription"**
3. You should be redirected to Stripe's Customer Portal
4. Test features:
   - ✅ Cancel subscription (can reactivate immediately)
   - ✅ Update payment method
   - ✅ View invoices
   - ✅ Switch plans

## What Users Will See

After configuration, users can:
- View current subscription details
- Cancel their subscription
- Update payment methods
- Switch between monthly and annual plans
- View and download invoice history
- Update billing information

## Important Notes

### Cancellation Behavior
**Recommended:** "Cancel at end of billing period"
- User keeps full access until period ends
- Better user experience
- Allows time to reactivate

### Test vs Live Mode
- Configure in **test mode** first
- Test thoroughly
- Then configure the same in **live mode** before going to production

### Environment Variables
Make sure you have:
```env
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Troubleshooting

### Portal Opens But Shows "No subscriptions"
- Check user has `stripe_customer_id` in database
- Verify Stripe customer exists

### Can't Cancel Subscription
- Go back to Portal Settings
- Ensure "Allow customers to cancel" is enabled
- Check product configuration

### Can't Switch Plans
- Go to each product → Additional options
- Enable "Customers can switch to other prices"

## After Configuration

Once everything works:
1. ✅ Test all features thoroughly
2. ✅ Configure the same in **live mode**
3. ✅ Update production environment variables
4. ✅ Remove debug logging (optional)

---

**Your code is ready! Just configure the portal settings and you're good to go!** 🚀

