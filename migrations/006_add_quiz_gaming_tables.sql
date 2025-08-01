-- Migration: Add Quiz and Gaming Tables
-- Date: 2025-01-XX
-- Description: Adds missing quiz and gaming tables from schema_core.md

-- 1. QuizTemplates Table
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES quiz_templates(id),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  quiz_name VARCHAR NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT -1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QuizParticipantRoles Table
CREATE TABLE IF NOT EXISTS quiz_participant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, participant_id)
);

-- 4. QuizResponses Table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES custom_questions(id) ON DELETE CASCADE,
  response TEXT,
  is_correct BOOLEAN,
  response_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Gaming Table
CREATE TABLE IF NOT EXISTS gaming (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name VARCHAR NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  game_type VARCHAR NOT NULL,
  game_config JSONB,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GameTemplates Table
CREATE TABLE IF NOT EXISTS game_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR NOT NULL UNIQUE,
  game_type VARCHAR NOT NULL,
  description TEXT,
  default_config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_templates_active ON quiz_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quizzes_group_id ON quizzes(group_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON quizzes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quiz_participant_roles_quiz_id ON quiz_participant_roles(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_participant_roles_participant_id ON quiz_participant_roles(participant_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id ON quiz_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_participant_id ON quiz_responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_gaming_group_id ON gaming(group_id);
CREATE INDEX IF NOT EXISTS idx_gaming_active ON gaming(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_game_templates_active ON game_templates(is_active) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_participant_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active quiz templates" ON quiz_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active quizzes" ON quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view quiz participant roles" ON quiz_participant_roles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view quiz responses" ON quiz_responses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active gaming" ON gaming
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active game templates" ON game_templates
  FOR SELECT USING (is_active = true); 