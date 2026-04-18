-- Allow anonymous visitors to submit a lead (audit request) from the public form.
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Deny direct read access to the leads table from clients.
-- Lead data (emails, audit results, enrichment) is sensitive and is only
-- read server-side via the service role client.
CREATE POLICY "No direct read access to leads"
  ON public.leads
  FOR SELECT
  USING (false);