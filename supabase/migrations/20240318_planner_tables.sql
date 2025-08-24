-- Create enum types for planner specialties and service levels
CREATE TYPE planner_service_level AS ENUM (
  'full-service',
  'partial',
  'day-of',
  'month-of',
  'consultation'
);

CREATE TYPE planner_specialty AS ENUM (
  'destination',
  'local',
  'luxury',
  'budget-friendly',
  'micro-wedding',
  'large-wedding',
  'cultural',
  'religious',
  'lgbtq',
  'eco-friendly',
  'beach',
  'mountain',
  'urban',
  'rustic',
  'vineyard',
  'estate'
);

-- Create planner profiles table
CREATE TABLE planner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  website TEXT,
  service_level planner_service_level NOT NULL,
  specialties planner_specialty[] NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE planner_profiles ENABLE ROW LEVEL SECURITY;

-- Planners can read their own profile
CREATE POLICY "Planners can view own profile" ON planner_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Planners can update their own profile
CREATE POLICY "Planners can update own profile" ON planner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER update_planner_profile_timestamp
  BEFORE UPDATE ON planner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_update();
