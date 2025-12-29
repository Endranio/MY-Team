-- Allow captains to update their team regardless of status (pending or approved)
-- Previously it was restricted to 'approved' teams only in 20251214_create_teams_table.sql

DROP POLICY IF EXISTS "Captains can update own team" ON public.teams;

CREATE POLICY "Captains can update own team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (captain_id = auth.uid())
  WITH CHECK (captain_id = auth.uid());
