CREATE POLICY "Server can update leads"
  ON public.leads
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);