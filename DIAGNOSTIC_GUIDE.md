# 🔧 Decision Tree System - Diagnostic Guide

## ✅ Implementation Status

### What Was Created
1. ✅ **New Page**: `/app/build/page.tsx` - Separate from existing `/create` page
2. ✅ **Navigation Buttons**: Added to homepage and dashboard
3. ✅ **All Components**: DecisionNode, ChoicePanel, ProgressTracker, InteractiveBuilder
4. ✅ **API Routes**: `/api/decision-tree/next`, `/save`, `/generate`
5. ✅ **Types & Data**: Complete decision tree structure

## 🧪 Quick Tests

### Test 1: Navigate to `/build`
1. Go to: `http://localhost:3000/build`
2. **Expected**: Welcome message with rocket emoji
3. **If blank**: Check browser console for errors

### Test 2: Check Buttons
1. **Homepage**: Should see "🎯 Try Interactive Builder (NEW!)" button
2. **Dashboard**: Should see "🎯 Interactive Builder (NEW!)" button next to "Create New Project"
3. **Click**: Should navigate to `/build`

### Test 3: Browser Console
Open DevTools (F12) → Console tab
- ❌ **Red errors?** → Check import paths
- ❌ **Module not found?** → Check `tsconfig.json` paths
- ❌ **API errors?** → Check API routes exist

### Test 4: Terminal Logs
Check your dev server terminal:
- ❌ **404 errors?** → Page route not found
- ❌ **500 errors?** → API route issue
- ❌ **Import errors?** → TypeScript path issue

## 🔍 Common Issues & Fixes

### Issue 1: Blank Screen
**Symptoms**: Page loads but shows nothing

**Causes**:
- Missing database table (run `database/schema.sql`)
- React Flow not loading
- Import path errors

**Fix**:
1. Check browser console for errors
2. Verify `decision_paths` table exists in Supabase
3. Check `tsconfig.json` has `"@/*": ["./src/*"]`

### Issue 2: Module Not Found
**Symptoms**: Console shows `Cannot find module '@/types/decision-tree'`

**Fix**:
1. Verify `src/types/decision-tree.ts` exists
2. Check `tsconfig.json` paths configuration
3. Restart dev server: `npm run dev`

### Issue 3: API Route Errors
**Symptoms**: 404 or 500 errors when clicking choices

**Fix**:
1. Verify API routes exist:
   - `src/app/api/decision-tree/next/route.ts`
   - `src/app/api/decision-tree/save/route.ts`
   - `src/app/api/decision-tree/generate/route.ts`
2. Check environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

### Issue 4: Database Errors
**Symptoms**: "Table does not exist" or "Permission denied"

**Fix**:
1. Run the SQL migration in Supabase:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy/paste `database/schema.sql`
   - Run it
2. Verify table exists:
   ```sql
   SELECT * FROM decision_paths LIMIT 1;
   ```

## 📋 Checklist

Before testing, verify:
- [ ] Database migration ran successfully
- [ ] All environment variables are set
- [ ] Dev server is running (`npm run dev`)
- [ ] No TypeScript errors (`npm run build` should work)
- [ ] Navigation buttons are visible

## 🚀 Quick Start

1. **Run database migration** (if not done):
   ```sql
   -- Copy/paste database/schema.sql in Supabase SQL Editor
   ```

2. **Test the page**:
   - Navigate to: `http://localhost:3000/build`
   - Should see welcome message

3. **Test the flow**:
   - Click the first question node
   - Choice panel should slide in
   - Select a choice
   - Next question should appear

4. **Check for errors**:
   - Browser console (F12)
   - Terminal logs
   - Network tab (F12 → Network)

## 🐛 Still Having Issues?

1. **Check file structure**:
   ```
   src/
   ├── app/
   │   └── build/
   │       └── page.tsx          ✅ Should exist
   ├── components/
   │   ├── InteractiveBuilder.tsx ✅ Should exist
   │   ├── DecisionNode.tsx       ✅ Should exist
   │   ├── ChoicePanel.tsx        ✅ Should exist
   │   └── ProgressTracker.tsx    ✅ Should exist
   ├── types/
   │   └── decision-tree.ts      ✅ Should exist
   └── data/
       └── decision-tree.ts       ✅ Should exist
   ```

2. **Verify imports**:
   - All imports use `@/` prefix
   - TypeScript paths configured correctly

3. **Test API routes directly**:
   ```bash
   curl -X POST http://localhost:3000/api/decision-tree/next \
     -H "Content-Type: application/json" \
     -d '{"currentDecisions": {}, "appPurpose": null, "appType": null}'
   ```

## 📞 Need Help?

If you're still stuck:
1. Share browser console errors
2. Share terminal/server logs
3. Share what you see when navigating to `/build`
4. Check if database migration ran successfully

