-- Database schema for decision tree system
-- Run this in your Supabase SQL Editor

-- Create decision_paths table
CREATE TABLE IF NOT EXISTS decision_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  app_purpose TEXT NOT NULL, -- 'ecommerce', 'saas', 'social', etc.
  app_type TEXT NOT NULL, -- 'web', 'mobile', 'desktop', 'pwa'
  decisions JSONB NOT NULL DEFAULT '{}', -- { "payment": "stripe", "auth": "clerk", ... }
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  generated_mindmap JSONB, -- Full mindmap JSON when generation complete
  completed_at TIMESTAMPTZ, -- When user finished all questions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_decision_paths_user_id ON decision_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_paths_session_id ON decision_paths(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_paths_completed_at ON decision_paths(completed_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE decision_paths ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are disabled for now since we're using Clerk for auth
-- The API routes use Supabase Service Role Key which bypasses RLS
-- If you want to enable RLS with Clerk, you'll need to set up a custom JWT integration
-- For now, the service role key ensures only your backend can access this table

-- Users can only see their own decision paths (disabled - using service role key)
-- CREATE POLICY "Users can view own decision paths" 
--   ON decision_paths 
--   FOR SELECT 
--   USING (true); -- Allow all for now, API routes enforce user access

-- Users can insert their own decision paths (disabled - using service role key)
-- CREATE POLICY "Users can insert own decision paths" 
--   ON decision_paths 
--   FOR INSERT 
--   WITH CHECK (true); -- Allow all for now, API routes enforce user access

-- Users can update their own decision paths (disabled - using service role key)
-- CREATE POLICY "Users can update own decision paths" 
--   ON decision_paths 
--   FOR UPDATE 
--   USING (true); -- Allow all for now, API routes enforce user access

-- Add comments for documentation
COMMENT ON TABLE decision_paths IS 'Stores user journey through decision tree for app generation';
COMMENT ON COLUMN decision_paths.decisions IS 'JSONB object containing all user choices: {"payment": "stripe", "auth": "clerk", ...}';
COMMENT ON COLUMN decision_paths.generated_mindmap IS 'Full React Flow mindmap JSON generated from user decisions';
COMMENT ON COLUMN decision_paths.completed_at IS 'Timestamp when user completed all questions and generated their app';

