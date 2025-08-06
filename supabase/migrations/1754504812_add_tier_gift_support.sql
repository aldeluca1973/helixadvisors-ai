-- Migration: add_tier_gift_support
-- Created at: 1754504812

-- Create table for tracking gift passes
CREATE TABLE IF NOT EXISTS tier_gift_records (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tier_granted TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add gift tier expiry column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS gift_tier_expiry TIMESTAMP WITH TIME ZONE;

-- Fix admin tier to professional
UPDATE user_profiles
SET current_tier = 'professional'
WHERE is_admin = TRUE;

-- Add RLS policies
ALTER TABLE tier_gift_records ENABLE ROW LEVEL SECURITY;

-- Admins can view all gift records
CREATE POLICY "Admins can view all gift records" 
ON tier_gift_records FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- Users can view their own gift records
CREATE POLICY "Users can view their own gift records" 
ON tier_gift_records FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Only admins can insert records
CREATE POLICY "Only admins can create gift records" 
ON tier_gift_records FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);