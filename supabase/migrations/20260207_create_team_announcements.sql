-- ============================================
-- Team Announcements Feature
-- For internal team announcements with image support
-- ============================================

-- Create team_announcements table
CREATE TABLE public.team_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for team_announcements
-- ============================================

-- Team members can view announcements of their team
CREATE POLICY "Team members can view announcements"
  ON public.team_announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_announcements.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.status = 'active'
    )
  );

-- Admin can view all announcements
CREATE POLICY "Admin can view all announcements"
  ON public.team_announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Captain can create announcements for their team
CREATE POLICY "Captain can create announcements"
  ON public.team_announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_announcements.team_id
      AND teams.captain_id = auth.uid()
      AND teams.status = 'approved'
    )
  );

-- Admin can create announcements for any team
CREATE POLICY "Admin can create announcements"
  ON public.team_announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Captain can delete their own team's announcements
CREATE POLICY "Captain can delete announcements"
  ON public.team_announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_announcements.team_id
      AND teams.captain_id = auth.uid()
    )
  );

-- Admin can delete any announcement
CREATE POLICY "Admin can delete announcements"
  ON public.team_announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- Storage bucket for announcement images
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-announcements', 'team-announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for team-announcements bucket
CREATE POLICY "Anyone can view announcement images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-announcements');

CREATE POLICY "Captains and admins can upload announcement images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-announcements'
  AND (
    -- Check if user is a captain
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.captain_id = auth.uid()
      AND teams.status = 'approved'
    )
    OR
    -- Check if user is an admin
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
);

CREATE POLICY "Captains and admins can delete announcement images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-announcements'
  AND (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.captain_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
);

-- Create index for faster queries
CREATE INDEX idx_team_announcements_team_id ON public.team_announcements(team_id);
CREATE INDEX idx_team_announcements_created_at ON public.team_announcements(created_at DESC);
