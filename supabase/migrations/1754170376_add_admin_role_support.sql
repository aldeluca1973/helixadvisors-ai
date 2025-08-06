-- Migration: add_admin_role_support
-- Created at: 1754170376

-- Add admin role column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create the admin user profile
INSERT INTO user_profiles (id, email, full_name, current_tier, is_admin, created_at, updated_at)
VALUES (
  'c1f741ce-f52f-4b73-9ace-2ef738b5476e',
  'admin@helixadvisors.com',
  'Helix Advisors Admin',
  'professional',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = TRUE,
  current_tier = 'professional',
  updated_at = NOW();;