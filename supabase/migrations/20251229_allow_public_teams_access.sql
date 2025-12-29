-- Allow public (unauthenticated) read access to approved teams
CREATE POLICY "Public can view approved teams"
  ON public.teams FOR SELECT
  TO anon
  USING (status = 'approved');

-- Also allow public read access to profiles (needed for captain name)
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Ensure public can view streams too (checking streams policy)
-- The previously created policy for streams was "Everyone can view streams" using (true), 
-- but we should verify if it defaults to 'authenticated' or 'public' role if not specified TO.
-- Usually, if TO is not specified, it applies to all roles. 
-- But to be safe for anon:
CREATE POLICY "Public can view streams"
  ON public.streams FOR SELECT
  TO anon
  USING (true);
