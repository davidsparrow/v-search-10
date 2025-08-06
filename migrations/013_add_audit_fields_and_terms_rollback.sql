-- Migration 013 Rollback: Remove Audit Fields and Terms Acceptance
-- Removes audit trail and terms acceptance tracking from participants table
-- Author: Eventria Team
-- Date: 2024

-- Drop indexes first
DROP INDEX IF EXISTS idx_participants_terms_accepted;
DROP INDEX IF EXISTS idx_participants_terms_accepted_at;
DROP INDEX IF EXISTS idx_participants_created_at;
DROP INDEX IF EXISTS idx_participants_updated_at;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_participants_updated_at ON participants;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_participants_updated_at();

-- Remove audit fields
ALTER TABLE participants DROP COLUMN IF EXISTS created_at;
ALTER TABLE participants DROP COLUMN IF EXISTS updated_at;
ALTER TABLE participants DROP COLUMN IF EXISTS created_by;
ALTER TABLE participants DROP COLUMN IF EXISTS modified_by;
ALTER TABLE participants DROP COLUMN IF EXISTS terms_accepted;
ALTER TABLE participants DROP COLUMN IF EXISTS terms_accepted_at; 