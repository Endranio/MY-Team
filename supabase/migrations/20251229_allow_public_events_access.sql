-- Allow public (unauthenticated) read access to events
-- This ensures that the landing page can display upcoming events to visitors
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  TO anon
  USING (true);

-- Ensure authenticated users can also view events
CREATE POLICY "Authenticated users can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- Or a catch-all policy if preferred (Supabase applies OR logic if multiple policies exist)
-- The above is safe.
