-- Drop the previous policy if it exists
DROP POLICY IF EXISTS "Public can view approved teams" ON public.teams;

-- Create a new broader policy for public access to ALL teams
CREATE POLICY "Public can view all teams"
  ON public.teams FOR SELECT
  TO anon
  USING (true);

-- Ensure authenticated users can also view all teams (if not already covered)
-- The existing policy "Anyone can view approved teams" might be too restrictive now.
-- Let's broaden access for authenticated users as well if needed, or rely on a new general policy.
-- Note: It's cleaner to have one specific policy or a general one.

DROP POLICY IF EXISTS "Anyone can view approved teams" ON public.teams;

CREATE POLICY "Anyone can view all teams"
  ON public.teams FOR SELECT
  TO public
  USING (true);
