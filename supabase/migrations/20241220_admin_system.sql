-- Admin System and Client Support Platform
-- Migration: 20241220_admin_system.sql

-- Create admin roles enum
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'admin',
  'support_agent',
  'moderator'
);

-- Create support ticket status enum
CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'waiting_on_customer',
  'waiting_on_third_party',
  'resolved',
  'closed'
);

-- Create ticket priority enum
CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent',
  'critical'
);

-- Create ticket category enum
CREATE TYPE ticket_category AS ENUM (
  'account_access',
  'billing',
  'technical_issue',
  'feature_request',
  'bug_report',
  'general_inquiry',
  'account_recovery',
  'data_export',
  'privacy_request'
);

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'support_agent',
  department TEXT,
  supervisor_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  category ticket_category NOT NULL,
  priority ticket_priority DEFAULT 'medium',
  status ticket_status DEFAULT 'open',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  internal_notes TEXT,
  resolution TEXT,
  tags TEXT[],
  escalated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_target TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ticket responses table
CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL, -- Can be admin_user.id or auth.user.id
  author_type TEXT NOT NULL CHECK (author_type IN ('admin', 'customer')),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ticket_activities table for audit trail
CREATE TABLE ticket_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin_actions table for tracking admin operations
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'wedding', 'payment', etc.
  target_id UUID NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_sessions table for admin monitoring
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create system_metrics table for monitoring
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  tags JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_department ON admin_users(department);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_agent ON support_tickets(assigned_agent_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX idx_ticket_activities_ticket_id ON ticket_activities(ticket_id);
CREATE INDEX idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_target_type ON admin_actions(target_type);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for support_tickets
CREATE POLICY "Support agents can view assigned tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND (au.role IN ('super_admin', 'admin') OR au.id = assigned_agent_id)
    )
  );

CREATE POLICY "Support agents can update assigned tickets" ON support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND (au.role IN ('super_admin', 'admin') OR au.id = assigned_agent_id)
    )
  );

CREATE POLICY "Support agents can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin', 'support_agent')
    )
  );

-- RLS Policies for ticket_responses
CREATE POLICY "Support agents can view ticket responses" ON ticket_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      JOIN support_tickets st ON st.id = ticket_responses.ticket_id
      WHERE au.user_id = auth.uid() 
      AND (au.role IN ('super_admin', 'admin') OR au.id = st.assigned_agent_id)
    )
  );

CREATE POLICY "Support agents can create responses" ON ticket_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      JOIN support_tickets st ON st.id = ticket_responses.ticket_id
      WHERE au.user_id = auth.uid() 
      AND (au.role IN ('super_admin', 'admin', 'support_agent')
        OR (au.id = st.assigned_agent_id AND author_type = 'admin'))
    )
  );

-- RLS Policies for admin_actions (only admins can view)
CREATE POLICY "Only admins can view admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can create admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin', 'support_agent')
    )
  );

-- RLS Policies for system_metrics (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view system metrics" ON system_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for admin operations
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  ticket_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM support_tickets;
  
  ticket_number := 'TKT' || LPAD(next_number::TEXT, 6, '0');
  RETURN ticket_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update ticket status timestamps
CREATE OR REPLACE FUNCTION update_ticket_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update escalated_at
  IF NEW.status = 'in_progress' AND OLD.status = 'open' THEN
    NEW.escalated_at = TIMEZONE('utc', NOW());
  END IF;
  
  -- Update resolved_at
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = TIMEZONE('utc', NOW());
  END IF;
  
  -- Update closed_at
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = TIMEZONE('utc', NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_admin_users_timestamp
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_timestamps_trigger
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamps();

-- Insert default super admin (you'll need to update this with your actual user ID)
-- INSERT INTO admin_users (user_id, role, department, permissions) 
-- VALUES ('your-user-id-here', 'super_admin', 'Management', '{"all": true}');
