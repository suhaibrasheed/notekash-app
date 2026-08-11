-- Core user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  username text,
  avatar_id smallint DEFAULT 1,
  
  -- Onboarding & Profile Metadata
  has_onboarded boolean DEFAULT false,
  gender text DEFAULT NULL,
  bio text DEFAULT NULL,
  device_info jsonb DEFAULT '{}'::jsonb,
  
  -- Pro / Membership Status (Shared across all sub-apps)
  pro_tier text DEFAULT 'Spark',
  pro_expires_at timestamp with time zone DEFAULT NULL,
  is_admin boolean DEFAULT false,
  
  -- Focus Hub specific fields (Aggregated time in minutes)
  daily_focus integer DEFAULT 0,
  weekly_focus integer DEFAULT 0,
  monthly_focus integer DEFAULT 0,
  
  joinee_date timestamp with time zone DEFAULT now()
);

-- Row-level trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, pro_tier)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'Spark'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Write Guard Trigger to restrict client updates on critical membership fields
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Prevent direct update of membership and admin roles by non-admin authenticated users
  IF (OLD.pro_expires_at IS DISTINCT FROM NEW.pro_expires_at OR 
      OLD.pro_tier IS DISTINCT FROM NEW.pro_tier OR
      OLD.is_admin IS DISTINCT FROM NEW.is_admin) 
      AND auth.role() = 'authenticated' AND (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = false THEN
    RAISE EXCEPTION 'Direct updates to membership or roles are not allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_update();

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL,
  completed_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile fields (except membership/admin protected ones)" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Focus sessions are viewable by everyone" ON public.focus_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own focus sessions" ON public.focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
