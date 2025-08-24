-- Core tables for wedding planning platform
-- Migration: 20241220_core_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for wedding status and RSVP responses
CREATE TYPE wedding_status AS ENUM (
  'planning',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE rsvp_status AS ENUM (
  'pending',
  'attending',
  'not_attending',
  'maybe'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- Create couples table
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner1_name TEXT NOT NULL,
  partner2_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  wedding_date DATE,
  guest_count INTEGER DEFAULT 0,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create weddings table
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES planner_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT,
  venue_address TEXT,
  wedding_date DATE NOT NULL,
  ceremony_time TIME,
  reception_time TIME,
  status wedding_status DEFAULT 'planning',
  guest_count INTEGER DEFAULT 0,
  budget DECIMAL(10,2),
  theme TEXT,
  colors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RSVPs table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  plus_one_name TEXT,
  plus_one_email TEXT,
  status rsvp_status DEFAULT 'pending',
  dietary_restrictions TEXT,
  song_requests TEXT,
  notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status payment_status DEFAULT 'pending',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create analytics table for tracking user behavior
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create wedding_images table for better image management
CREATE TABLE wedding_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL, -- 'hero', 'gallery', 'venue', etc.
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create wedding_tasks table for planning management
CREATE TABLE wedding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  category TEXT, -- 'venue', 'catering', 'photography', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_weddings_couple_id ON weddings(couple_id);
CREATE INDEX idx_weddings_planner_id ON weddings(planner_id);
CREATE INDEX idx_weddings_date ON weddings(wedding_date);
CREATE INDEX idx_rsvps_wedding_id ON rsvps(wedding_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_wedding_images_wedding_id ON wedding_images(wedding_id);
CREATE INDEX idx_wedding_tasks_wedding_id ON wedding_tasks(wedding_id);
CREATE INDEX idx_wedding_tasks_due_date ON wedding_tasks(due_date);

-- Enable Row Level Security on all tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for couples
CREATE POLICY "Couples can view own profile" ON couples
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Couples can update own profile" ON couples
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Couples can insert own profile" ON couples
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weddings
CREATE POLICY "Users can view weddings they own" ON weddings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = weddings.couple_id
    )
  );

CREATE POLICY "Users can update weddings they own" ON weddings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = weddings.couple_id
    )
  );

CREATE POLICY "Users can insert weddings they own" ON weddings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = weddings.couple_id
    )
  );

-- RLS Policies for RSVPs (public read, couple write)
CREATE POLICY "Anyone can view RSVPs" ON rsvps
  FOR SELECT USING (true);

CREATE POLICY "Couples can manage RSVPs for their weddings" ON rsvps
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = (
        SELECT couple_id FROM weddings WHERE id = rsvps.wedding_id
      )
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics (read-only for users, full access for admins)
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wedding images
CREATE POLICY "Anyone can view public wedding images" ON wedding_images
  FOR SELECT USING (is_public = true);

CREATE POLICY "Couples can manage images for their weddings" ON wedding_images
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = (
        SELECT couple_id FROM weddings WHERE id = wedding_images.wedding_id
      )
    )
  );

-- RLS Policies for wedding tasks
CREATE POLICY "Users can view tasks for their weddings" ON wedding_tasks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = (
        SELECT couple_id FROM weddings WHERE id = wedding_tasks.wedding_id
      )
    )
  );

CREATE POLICY "Users can manage tasks for their weddings" ON wedding_tasks
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM couples WHERE id = (
        SELECT couple_id FROM weddings WHERE id = wedding_tasks.wedding_id
      )
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_couples_timestamp
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weddings_timestamp
  BEFORE UPDATE ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rsvps_timestamp
  BEFORE UPDATE ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_tasks_timestamp
  BEFORE UPDATE ON wedding_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle RSVP response timestamp
CREATE OR REPLACE FUNCTION update_rsvp_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status != 'pending' THEN
    NEW.responded_at = TIMEZONE('utc', NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rsvp_responded_at_trigger
  BEFORE UPDATE ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_rsvp_responded_at();
