-- ============================================
-- Team Management Feature
-- ============================================

-- Create teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_logo text,
  team_name text NOT NULL,
  team_description text,
  captain_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz
);

-- Unique constraint for team name
ALTER TABLE public.teams ADD CONSTRAINT teams_team_name_unique UNIQUE (team_name);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create team_members table
-- ============================================
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_team text NOT NULL CHECK (role_in_team IN ('captain', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'left', 'rejected')),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Constraint: One user can only be in ONE team (pending or active)
CREATE UNIQUE INDEX team_members_one_active_team_per_user 
ON public.team_members (user_id) 
WHERE status IN ('pending', 'active');

-- Constraint: One team can only have ONE captain (pending or active)
CREATE UNIQUE INDEX team_members_one_captain_per_team 
ON public.team_members (team_id) 
WHERE role_in_team = 'captain' AND status IN ('pending', 'active');

-- ============================================
-- Create team_audit_logs table
-- ============================================
CREATE TABLE public.team_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on team_audit_logs
ALTER TABLE public.team_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for teams
-- ============================================

-- Anyone authenticated can view approved teams
CREATE POLICY "Anyone can view approved teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Users can view their own pending/rejected teams
CREATE POLICY "Users can view own team requests"
  ON public.teams FOR SELECT
  TO authenticated
  USING (captain_id = auth.uid());

-- Admin can view all teams
CREATE POLICY "Admin can view all teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Users can create teams
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (captain_id = auth.uid());

-- Captains can update their own team details
CREATE POLICY "Captains can update own team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (captain_id = auth.uid() AND status = 'approved')
  WITH CHECK (captain_id = auth.uid());

-- Admin can update team status (approve/reject)
CREATE POLICY "Admin can update team status"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Captains can delete their own team
CREATE POLICY "Captains can delete own team"
  ON public.teams FOR DELETE
  TO authenticated
  USING (captain_id = auth.uid());

-- ============================================
-- RLS Policies for team_members
-- ============================================

-- Anyone authenticated can view active members of approved teams
CREATE POLICY "Anyone can view active team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.status = 'approved'
    )
  );

-- Users can view their own membership status
CREATE POLICY "Users can view own membership"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Captains can view all members of their team (including pending)
CREATE POLICY "Captains can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.captain_id = auth.uid()
    )
  );

-- Admin can view all team members
CREATE POLICY "Admin can view all team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Users can request to join teams
CREATE POLICY "Users can request to join teams"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role_in_team = 'member' AND status = 'pending');

-- Captains can insert themselves as captain
CREATE POLICY "Captains can insert themselves"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role_in_team = 'captain');

-- Captains can update members of their team (approve/reject)
CREATE POLICY "Captains can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.captain_id = auth.uid()
    )
  );

-- Users can update their own membership (leave team)
CREATE POLICY "Users can leave team"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (status = 'left');

-- Admin can update any team member
CREATE POLICY "Admin can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- RLS Policies for team_audit_logs
-- ============================================

-- Users can view audit logs for their team
CREATE POLICY "Users can view own team audit logs"
  ON public.team_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.team_id = team_audit_logs.team_id 
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'active'
    )
  );

-- Admin can view all audit logs
CREATE POLICY "Admin can view all audit logs"
  ON public.team_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- System can insert audit logs (via authenticated users)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.team_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Create storage bucket for team logos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for team logos
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-logos');

CREATE POLICY "Users can update own team logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own team logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
