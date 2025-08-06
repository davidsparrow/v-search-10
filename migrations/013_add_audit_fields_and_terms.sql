-- Migration 013: Add Audit Fields and Terms Acceptance
-- Adds comprehensive audit trail and terms acceptance tracking to participants table
-- Author: Eventria Team
-- Date: 2024

-- Add missing audit fields
ALTER TABLE participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE participants ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS modified_by UUID;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS terms_accepted TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS terms_accepted_ip INET;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS terms_accepted_location TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS terms_accepted_user_agent TEXT;

-- Add comments for documentation
COMMENT ON COLUMN participants.created_at IS 'Standard creation timestamp for audit trail';
COMMENT ON COLUMN participants.updated_at IS 'Standard modification timestamp for audit trail';
COMMENT ON COLUMN participants.created_by IS 'UUID of user/system that created this participant';
COMMENT ON COLUMN participants.modified_by IS 'UUID of user/system that last modified this participant';
COMMENT ON COLUMN participants.terms_accepted IS 'User initials indicating terms acceptance for first-time user detection';
COMMENT ON COLUMN participants.terms_accepted_at IS 'Timestamp when terms were accepted for compliance tracking';
COMMENT ON COLUMN participants.terms_accepted_ip IS 'IP address when terms were accepted for compliance and security';
COMMENT ON COLUMN participants.terms_accepted_location IS 'Geographic location (country/city) when terms were accepted';
COMMENT ON COLUMN participants.terms_accepted_user_agent IS 'Browser/device information when terms were accepted';

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on any modification
DROP TRIGGER IF EXISTS trigger_update_participants_updated_at ON participants;
CREATE TRIGGER trigger_update_participants_updated_at 
    BEFORE UPDATE ON participants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_participants_updated_at();

-- Update existing records to have proper created_at values
UPDATE participants 
SET created_at = joined_at 
WHERE created_at IS NULL AND joined_at IS NOT NULL;

-- Set created_at to NOW() for records without joined_at
UPDATE participants 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Set updated_at to created_at for existing records
UPDATE participants 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create index for efficient terms acceptance queries
CREATE INDEX IF NOT EXISTS idx_participants_terms_accepted ON participants(terms_accepted);
CREATE INDEX IF NOT EXISTS idx_participants_terms_accepted_at ON participants(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_participants_terms_accepted_ip ON participants(terms_accepted_ip);

-- Create index for audit trail queries
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_updated_at ON participants(updated_at DESC); 