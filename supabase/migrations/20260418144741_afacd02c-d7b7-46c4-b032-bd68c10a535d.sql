DROP POLICY IF EXISTS "Anyone can submit a valid lead" ON public.leads;

CREATE POLICY "Anyone can submit a valid lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(website)) > 0
    AND length(btrim(email)) > 0
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );