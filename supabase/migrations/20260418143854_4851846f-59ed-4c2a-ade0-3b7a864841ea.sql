DROP POLICY IF EXISTS "Server can update leads" ON public.leads;

CREATE POLICY "Server can finalize pending leads"
  ON public.leads
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'pending' AND audit IS NULL)
  WITH CHECK (status IN ('completed', 'failed'));