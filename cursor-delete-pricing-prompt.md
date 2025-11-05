# 🧹 Cursor Prompt: Safely Delete Old Pricing Components

## Objective
Identify and safely remove all old pricing page components from the CodeLaunch project. Pricing is now handled directly on the homepage (`/`), so the old `/pricing` page and related components are no longer needed.

---

## Step 1: Identify All Pricing-Related Files

Please search for and identify ALL files related to the old pricing page:

### Search Patterns:
1. **File paths containing "pricing":**
   - `src/app/pricing/**/*`
   - Any file with "pricing" in the name (case-insensitive)

2. **Files importing pricing components:**
   - Search for imports like: `import.*PricingPageClient`
   - Search for imports like: `import.*from.*pricing`
   - Search for imports like: `import.*Pricing`

3. **Routes/links referencing `/pricing`:**
   - Search for: `href="/pricing"`
   - Search for: `router.push('/pricing')`
   - Search for: `router.replace('/pricing')`
   - Search for: `redirect('/pricing')`
   - Search for: `'/pricing'`

4. **Components with pricing-related code:**
   - Search for: `PricingPageClient`
   - Search for: `PricingPage`
   - Search for pricing-specific colors: `purple-900`, `purple-500` (if used only for pricing)
   - Search for pricing amounts: `$99`, `$990`, `$39.99`, `$299.99`

### Expected Files to Find:
- `src/app/pricing/page.tsx`
- `src/app/pricing/PricingPageClient.tsx`
- Possibly references in `src/middleware.ts`
- Possibly references in navigation components

---

## Step 2: Create a Report

Before deleting anything, create a report showing:

1. **Files to Delete (complete files):**
   - List all files that should be completely removed
   - Show their file paths

2. **Code Sections to Remove (partial):**
   - List files that contain pricing code but shouldn't be deleted entirely
   - Show the specific code sections/lines to remove
   - Include context (surrounding lines) so it's clear what to remove

3. **References to Update:**
   - List all files that reference `/pricing` or pricing components
   - Show what needs to be updated (remove redirects, update links, etc.)

---

## Step 3: Safety Checks

Before proceeding, verify:

✅ **DO NOT DELETE:**
- Backend Stripe API routes (`src/app/api/stripe/**`)
- Subscription management components (`src/components/SubscriptionManagement.tsx`)
- Dashboard subscription page (`src/app/dashboard/subscription/**`)
- Pricing section on homepage (`src/app/page.tsx` - pricing section should stay)
- Stripe checkout logic (`src/app/api/stripe/create-checkout/**`)
- Any subscription-related backend code

✅ **DO DELETE:**
- Old pricing page route (`src/app/pricing/page.tsx`)
- Old pricing page client component (`src/app/pricing/PricingPageClient.tsx`)
- Redirects to `/pricing` (update to redirect to `/#pricing` instead)
- Navigation links to `/pricing` (update to `/#pricing` instead)

---

## Step 4: Execute Deletion

Once you've created the report and I've reviewed it, proceed with:

1. **Delete complete files:**
   - Remove `src/app/pricing/page.tsx`
   - Remove `src/app/pricing/PricingPageClient.tsx`
   - If the `pricing` directory becomes empty, remove it too

2. **Remove code sections:**
   - Remove imports of `PricingPageClient` or `PricingPage`
   - Remove redirects to `/pricing` (in middleware or elsewhere)
   - Update navigation links from `/pricing` to `/#pricing`

3. **Update references:**
   - In `src/middleware.ts`: Remove `/pricing` from public routes array (line 9)
   - In `src/components/SubscriptionManagement.tsx`: Update `/pricing` link to `/#pricing`
   - In `src/components/SubscriptionStatus.tsx`: Update `/pricing` link to `/#pricing`
   - In `src/app/dashboard/subscription/page.tsx`: Update `/pricing` link to `/#pricing`
   - In `src/app/api/stripe/create-checkout/route.ts`: Update `cancelUrl` from `/pricing?canceled=true` to `/?canceled=true` or `/#pricing`

---

## Step 5: Verification

After deletion, verify:

1. **No broken imports:**
   - Check that no files are importing deleted components
   - Run a build check if possible

2. **No broken routes:**
   - Confirm `/pricing` route no longer exists
   - Verify all links point to `/#pricing` instead

3. **Functionality preserved:**
   - Verify homepage pricing section still works
   - Verify Stripe checkout still works
   - Verify subscription management still works

---

## Expected Outcome

After cleanup:
- ✅ `/pricing` route should return 404
- ✅ All pricing links should point to `/#pricing` (homepage anchor)
- ✅ No broken imports or references
- ✅ Homepage pricing section remains functional
- ✅ Stripe checkout and subscription management remain functional

---

## Important Notes

1. **Preserve homepage pricing:** The pricing section on the homepage (`src/app/page.tsx`) should NOT be deleted - only the old `/pricing` page route.

2. **Preserve subscription logic:** All backend Stripe and subscription management code should remain untouched.

3. **Update redirects:** If middleware or other code redirects to `/pricing`, update those to redirect to `/#pricing` instead (or remove the redirect entirely if not needed).

4. **Clean up imports:** After deleting files, remove any unused imports related to pricing components.

---

## Specific Changes Needed

Based on my analysis, here are the exact changes:

### Files to Delete:
1. `src/app/pricing/page.tsx` - Entire file
2. `src/app/pricing/PricingPageClient.tsx` - Entire file
3. `src/app/pricing/` directory (if empty after deletions)

### Files to Update:

1. **`src/middleware.ts`** (line 9):
   - Remove: `'/pricing',`
   - From the `isPublicRoute` array

2. **`src/components/SubscriptionManagement.tsx`** (around line 114):
   - Change: `window.location.href = '/pricing'`
   - To: `window.location.href = '/#pricing'`

3. **`src/components/SubscriptionStatus.tsx`** (around line 33):
   - Change: `href="/pricing"`
   - To: `href="/#pricing"`

4. **`src/app/dashboard/subscription/page.tsx`** (around line 178):
   - Change: `href="/pricing"`
   - To: `href="/#pricing"`

5. **`src/app/api/stripe/create-checkout/route.ts`** (around line 76):
   - Change: `cancelUrl: \`${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true\``
   - To: `cancelUrl: \`${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true\``
   - Or: `cancelUrl: \`${process.env.NEXT_PUBLIC_APP_URL}/#pricing\``

---

## Command to Run After Review

Once you've shown me the report and I've confirmed, proceed with:
- Deletion of identified files
- Removal of identified code sections
- Updating of identified references
- Verification that everything still works

**Please start by creating the report first, then wait for my confirmation before deleting anything.**
