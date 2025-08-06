-- Migration: fix_auth_configuration
-- Created at: 1754076611

-- Enable RLS on user_profiles table if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_profiles to allow users to read/update their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, current_tier, daily_usage_count)
  VALUES (new.id, new.email, 'free', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();;