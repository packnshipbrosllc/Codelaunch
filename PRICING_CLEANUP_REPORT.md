# 🧹 Old Pricing Components - Analysis Report

## 📋 Files Found

### ✅ Files to DELETE (Complete Files):

1. **`src/app/pricing/page.tsx`** (15 lines)
   - Server component that renders PricingPageClient
   - Contains: Suspense wrapper and PricingPageClient import

2. **`src/app/pricing/PricingPageClient.tsx`** (~363 lines)
   - Complete old pricing page component
   - Contains: Purple theme, $39.99/$299.99 pricing, subscription logic
   - This is the entire old pricing page

3. **`src/app/pricing/` directory**
   - Will be empty after deletions, can be removed

---

### 🔧 Files to UPDATE (Fix References):

1. **`src/middleware.ts`** (Line 9)
   - **Current:** `'/pricing',` in public routes
   - **Action:** Remove this line (no longer needed)

2. **`src/components/SubscriptionManagement.tsx`** (Line 114)
   - **Current:** `window.location.href = '/pricing'`
   - **Action:** Change to `window.location.href = '/#pricing'`

3. **`src/components/SubscriptionStatus.tsx`** (Line 33)
   - **Current:** `href="/pricing"`
   - **Action:** Change to `href="/#pricing"`

4. **`src/app/dashboard/subscription/page.tsx`** (Line 178)
   - **Current:** `href="/pricing"`
   - **Action:** Change to `href="/#pricing"`

5. **`src/app/api/stripe/create-checkout/route.ts`** (Line 76)
   - **Current:** `cancelUrl: \`${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true\``
   - **Action:** Change to `cancelUrl: \`${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true\``

---

### ✅ Files to KEEP (These are correct):

1. **`src/app/page.tsx`**
   - Contains homepage pricing section (new pricing) - KEEP THIS
   - Has `#pricing` anchor links - CORRECT

2. **`src/lib/stripe.ts`**
   - Contains Stripe price configuration - KEEP THIS
   - Has pricing amounts for reference - CORRECT

3. **`src/components/stages/MindmapStage.tsx`**
   - Contains example pricing in demo data - KEEP THIS

4. **`src/app/create/page.tsx`**
   - Has link to `/#pricing` - CORRECT

5. **`src/components/MindmapLimitBanner.tsx`**
   - Has links to `/#pricing` - CORRECT

---

## 📊 Summary

**Files to Delete:** 2 files
- `src/app/pricing/page.tsx`
- `src/app/pricing/PricingPageClient.tsx`

**Files to Update:** 5 files
- `src/middleware.ts` (remove `/pricing` route)
- `src/components/SubscriptionManagement.tsx` (update link)
- `src/components/SubscriptionStatus.tsx` (update link)
- `src/app/dashboard/subscription/page.tsx` (update link)
- `src/app/api/stripe/create-checkout/route.ts` (update cancel URL)

**Files to Keep:** All other files are correct

---

## ⚠️ Safety Notes

- ✅ Homepage pricing section (`src/app/page.tsx`) will be preserved
- ✅ Stripe API routes will be preserved
- ✅ Subscription management will be preserved
- ✅ All references will point to `/#pricing` (homepage anchor)

---

## 🚀 Ready to Proceed?

After you confirm, I will:
1. Delete the 2 pricing page files
2. Update the 5 files with broken references
3. Verify no broken imports remain
4. Test that all links point to homepage pricing

