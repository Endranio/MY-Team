-- Fix RLS policy for captain transfer
-- The previous policy WITH CHECK prevented changing captain_id to another user

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Captains can update own team" ON public.teams;

-- Create new policy that allows captain to update team including transferring captain role
CREATE POLICY "Captains can update own team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (captain_id = auth.uid() AND status = 'approved');
