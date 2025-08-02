-- Migration: Add Social Cred Rating
-- Date: 2025-01-XX
-- Description: Adds social_cred_rating column to participants table

-- Add social_cred_rating column to participants table
ALTER TABLE participants ADD COLUMN IF NOT EXISTS social_cred_rating DECIMAL(3,1) DEFAULT 0.0;

-- Create index for efficient rating queries
CREATE INDEX IF NOT EXISTS idx_participants_social_cred_rating ON participants(social_cred_rating DESC);

-- Add comment for documentation
COMMENT ON COLUMN participants.social_cred_rating IS 'Social credibility rating from 0.0 to 2.0, used for B-chips conversion'; 