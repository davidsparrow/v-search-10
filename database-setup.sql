-- Database Setup for Admin System and Text Logo Variations
-- Run this in your Supabase SQL Editor

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Create text_logo_variations table
CREATE TABLE IF NOT EXISTS text_logo_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create system_settings table (if not already exists from schema_core.md)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_text_logo_variations_active ON text_logo_variations(is_active);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- 5. Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_logo_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Text logo variations policies
CREATE POLICY "Anyone can view active logo variations" ON text_logo_variations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage logo variations" ON text_logo_variations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- System settings policies
CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 6. Insert default admin user (replace with your actual user ID)
-- You'll need to replace 'YOUR_USER_ID_HERE' with your actual Supabase user ID
-- To get your user ID, check the auth.users table in Supabase
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 7. Insert some sample logo variations
INSERT INTO text_logo_variations (filename, display_name, destination_url, is_active) VALUES
('logo-classic-blue.png', 'Classic Blue', 'https://askbender.com', true),
('logo-dark-theme.png', 'Dark Theme', 'https://askbender.com', true),
('logo-emoji-version.png', 'Emoji Version', 'https://askbender.com', true),
('logo-gradient.png', 'Gradient Style', 'https://askbender.com', true),
('logo-minimal.png', 'Minimal Design', 'https://askbender.com', true)
ON CONFLICT (filename) DO NOTHING;

-- 8. Insert some sample system settings
INSERT INTO system_settings (key, value, description) VALUES
('default_logo_fallback', '/askbender-text-logo-transparent.png', 'Default logo to use when dynamic logos fail'),
('logo_rotation_frequency', 'session', 'How often to rotate logos: session, daily, weekly'),
('max_logo_file_size', '1024000', 'Maximum file size for logo uploads in bytes'),
('allowed_logo_formats', 'png,jpg,jpeg', 'Comma-separated list of allowed logo file formats')
ON CONFLICT (key) DO NOTHING;

-- 9. Create storage bucket for text logos
-- Note: You'll need to create this bucket manually in Supabase Storage
-- Bucket name: text-logos
-- Public bucket: true
-- File size limit: 1MB
-- Allowed MIME types: image/png, image/jpeg, image/jpg 