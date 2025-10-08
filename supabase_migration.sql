-- VIP SIM RACING - Supabase Database Migration
-- This SQL file creates the profiles table and sets up Row Level Security

-- =============================================
-- 1. Create profiles table
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  dob date NOT NULL,
  phone text NOT NULL,
  address text,
  state text,
  zip_code text,
  emergency_name text NOT NULL,
  emergency_phone text NOT NULL,
  profile_picture text,
  banner_image text,
  bio text,
  racing_credits integer DEFAULT 0,
  account_balance numeric DEFAULT 0,
  is_admin boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_active timestamptz DEFAULT now(),
  current_simulator integer,
  is_streaming boolean DEFAULT false,
  current_game text,
  status text DEFAULT 'offline',
  status_message text,
  registration_source text,
  device_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 2. Enable Row Level Security
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. Create RLS Policies
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Public can read basic profile info (for leaderboards, etc)
CREATE POLICY "Public can read basic profile info"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- =============================================
-- 4. Create function to auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. Create trigger for updated_at
-- =============================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SETUP COMPLETE
-- =============================================
-- Your profiles table is now ready!
-- Users will be automatically created in auth.users when they register
-- Their profile data will be stored in the profiles table
