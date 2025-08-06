-- Migration 012: Add User Default Values
-- Sets default values for user preferences and ensures new users have proper defaults
-- Author: Eventria Team
-- Date: 2024

-- Update existing participants with null values to have proper defaults
UPDATE participants 
SET 
  professional_mode_always = COALESCE(professional_mode_always, false),
  pref_timeout = COALESCE(pref_timeout, 300),
  preferred_communication_method = COALESCE(preferred_communication_method, 'sms'),
  sms_character_limit = COALESCE(sms_character_limit, 160),
  real_score = COALESCE(real_score, 0),
  display_score = COALESCE(display_score, 0),
  social_cred_rating = COALESCE(social_cred_rating, 0.0)
WHERE 
  professional_mode_always IS NULL 
  OR pref_timeout IS NULL 
  OR preferred_communication_method IS NULL 
  OR sms_character_limit IS NULL 
  OR real_score IS NULL 
  OR display_score IS NULL 
  OR social_cred_rating IS NULL;

-- Create a function to set defaults for new participants
CREATE OR REPLACE FUNCTION set_participant_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Set defaults for new participants
  NEW.professional_mode_always = COALESCE(NEW.professional_mode_always, false);
  NEW.pref_timeout = COALESCE(NEW.pref_timeout, 300);
  NEW.preferred_communication_method = COALESCE(NEW.preferred_communication_method, 'sms');
  NEW.sms_character_limit = COALESCE(NEW.sms_character_limit, 160);
  NEW.real_score = COALESCE(NEW.real_score, 0);
  NEW.display_score = COALESCE(NEW.display_score, 0);
  NEW.social_cred_rating = COALESCE(NEW.social_cred_rating, 0.0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set defaults for new participants
DROP TRIGGER IF EXISTS trigger_set_participant_defaults ON participants;
CREATE TRIGGER trigger_set_participant_defaults
  BEFORE INSERT ON participants
  FOR EACH ROW
  EXECUTE FUNCTION set_participant_defaults(); 