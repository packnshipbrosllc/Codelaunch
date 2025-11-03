-- Add mindmaps_created counter to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mindmaps_created INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_mindmaps_created ON users(mindmaps_created);

-- Update existing users to have 0 mindmaps created
UPDATE users 
SET mindmaps_created = 0 
WHERE mindmaps_created IS NULL;

-- Verify it worked (you can run this separately)
-- SELECT id, subscription_status, mindmaps_created 
-- FROM users 
-- LIMIT 5;

