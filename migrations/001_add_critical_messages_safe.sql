-- Migration: Add Critical Message Support for eventria-mvp (SAFE MODE)
-- Date: 2024-01-XX
-- Description: Adds critical message fields to Messages table, extends UserSessions, and creates essential tables
-- SAFE MODE: Uses IF NOT EXISTS to prevent errors if already run

DO $$ BEGIN
    -- 1. Add critical message fields to existing Messages table (SAFE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_critical') THEN
        ALTER TABLE messages ADD COLUMN is_critical BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'critical_keyword') THEN
        ALTER TABLE messages ADD COLUMN critical_keyword VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'response_required') THEN
        ALTER TABLE messages ADD COLUMN response_required BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'auto_reply') THEN
        ALTER TABLE messages ADD COLUMN auto_reply TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'responded_at') THEN
        ALTER TABLE messages ADD COLUMN responded_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'status') THEN
        ALTER TABLE messages ADD COLUMN status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'timeout', 'auto_replied'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type_id') THEN
        ALTER TABLE messages ADD COLUMN message_type_id UUID;
    END IF;

    -- 2. Add interruption tracking to existing user_sessions table (SAFE)
    -- Only add if user_sessions table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'is_interrupted') THEN
            ALTER TABLE user_sessions ADD COLUMN is_interrupted BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'interruption_snapshot') THEN
            ALTER TABLE user_sessions ADD COLUMN interruption_snapshot JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'interrupted_at') THEN
            ALTER TABLE user_sessions ADD COLUMN interrupted_at TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'resumed_at') THEN
            ALTER TABLE user_sessions ADD COLUMN resumed_at TIMESTAMP;
        END IF;
    END IF;

    -- 3. Create MessageTypes table (SAFE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messagetypes') THEN
        CREATE TABLE messagetypes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type_name VARCHAR NOT NULL UNIQUE,
          display_name VARCHAR NOT NULL,
          priority_level INTEGER NOT NULL DEFAULT 0,
          default_timeout_seconds INTEGER NOT NULL DEFAULT 300,
          auto_interrupt BOOLEAN DEFAULT true,
          default_auto_reply TEXT,
          admin_configurable BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 4. Create ReservedKeywords table (SAFE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservedkeywords') THEN
        CREATE TABLE reservedkeywords (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          keyword VARCHAR NOT NULL UNIQUE,
          message_type_id UUID NOT NULL,
          trigger_flow VARCHAR,
          admin_only BOOLEAN DEFAULT false,
          requires_confirmation BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 5. Create SessionInterruptions table (SAFE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessioninterruptions') THEN
        CREATE TABLE sessioninterruptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          participant_id UUID NOT NULL,
          original_session_id UUID NOT NULL,
          critical_message_id UUID NOT NULL,
          session_snapshot JSONB,
          interruption_reason VARCHAR DEFAULT 'critical_message',
          auto_resume BOOLEAN DEFAULT true,
          admin_override BOOLEAN DEFAULT false,
          interrupted_at TIMESTAMP DEFAULT NOW(),
          resumed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 6. Add message_type_id to existing prompt_templates table (SAFE)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_templates' AND column_name = 'message_type_id') THEN
            ALTER TABLE prompt_templates ADD COLUMN message_type_id UUID;
        END IF;
    END IF;

END $$;

-- Create indexes for performance (SAFE)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_is_critical') THEN
        CREATE INDEX idx_messages_is_critical ON messages(is_critical);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_critical_status') THEN
        CREATE INDEX idx_messages_critical_status ON messages(status) WHERE is_critical = true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_type') THEN
        CREATE INDEX idx_messages_type ON messages(message_type_id) WHERE message_type_id IS NOT NULL;
    END IF;
    
    -- Only create user_sessions indexes if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_interrupted') THEN
            CREATE INDEX idx_user_sessions_interrupted ON user_sessions(is_interrupted) WHERE is_interrupted = true;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_message_types_priority') THEN
        CREATE INDEX idx_message_types_priority ON messagetypes(priority_level);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_message_types_name') THEN
        CREATE INDEX idx_message_types_name ON messagetypes(type_name);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reserved_keywords_keyword') THEN
        CREATE INDEX idx_reserved_keywords_keyword ON reservedkeywords(keyword);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reserved_keywords_type') THEN
        CREATE INDEX idx_reserved_keywords_type ON reservedkeywords(message_type_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_session_interruptions_participant') THEN
        CREATE INDEX idx_session_interruptions_participant ON sessioninterruptions(participant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_session_interruptions_active') THEN
        CREATE INDEX idx_session_interruptions_active ON sessioninterruptions(participant_id) WHERE resumed_at IS NULL;
    END IF;
    
    -- Only create prompt_templates index if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_templates') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prompt_templates_type') THEN
            CREATE INDEX idx_prompt_templates_type ON prompt_templates(message_type_id) WHERE message_type_id IS NOT NULL;
        END IF;
    END IF;
    
END $$;

-- Add foreign key constraints (SAFE)
DO $$ BEGIN
    -- Only add foreign keys if the referenced tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messagetypes') THEN
        -- Add foreign key to ReservedKeywords if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reservedkeywords_message_type_id_fkey') THEN
            ALTER TABLE reservedkeywords ADD CONSTRAINT reservedkeywords_message_type_id_fkey 
            FOREIGN KEY (message_type_id) REFERENCES messagetypes(id) ON DELETE CASCADE;
        END IF;
        
        -- Add foreign key to Messages if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_message_type_id_fkey') THEN
            ALTER TABLE messages ADD CONSTRAINT messages_message_type_id_fkey 
            FOREIGN KEY (message_type_id) REFERENCES messagetypes(id);
        END IF;
        
        -- Add foreign key to PromptTemplates if it doesn't exist and table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_templates') THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'prompt_templates_message_type_id_fkey') THEN
                ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_message_type_id_fkey 
                FOREIGN KEY (message_type_id) REFERENCES messagetypes(id);
            END IF;
        END IF;
    END IF;
    
    -- Add foreign keys to SessionInterruptions if referenced tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'participants') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessioninterruptions_participant_id_fkey') THEN
            ALTER TABLE sessioninterruptions ADD CONSTRAINT sessioninterruptions_participant_id_fkey 
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessioninterruptions_original_session_id_fkey') THEN
            ALTER TABLE sessioninterruptions ADD CONSTRAINT sessioninterruptions_original_session_id_fkey 
            FOREIGN KEY (original_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessioninterruptions_critical_message_id_fkey') THEN
            ALTER TABLE sessioninterruptions ADD CONSTRAINT sessioninterruptions_critical_message_id_fkey 
            FOREIGN KEY (critical_message_id) REFERENCES messages(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
END $$; 