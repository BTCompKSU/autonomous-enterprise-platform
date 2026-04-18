-- Function: create a pending lead and return its id
CREATE OR REPLACE FUNCTION public.create_pending_lead(_website text, _email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _w text := btrim(coalesce(_website, ''));
  _e text := lower(btrim(coalesce(_email, '')));
BEGIN
  IF length(_w) = 0 OR length(_w) > 255 THEN
    RAISE EXCEPTION 'Invalid website';
  END IF;
  IF length(_e) = 0 OR length(_e) > 255 OR _e !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  INSERT INTO public.leads (website, email, status)
  VALUES (_w, _e, 'pending')
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- Function: finalize a lead with audit results or an error
CREATE OR REPLACE FUNCTION public.finalize_lead(
  _lead_id uuid,
  _status text,
  _audit jsonb,
  _enrichment jsonb,
  _error text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _lead_id IS NULL THEN
    RAISE EXCEPTION 'lead_id required';
  END IF;
  IF _status NOT IN ('pending', 'completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.leads
    SET status = _status,
        audit = COALESCE(_audit, audit),
        enrichment = COALESCE(_enrichment, enrichment),
        error = _error,
        updated_at = now()
  WHERE id = _lead_id;
END;
$$;

-- Grant execute to anon + authenticated so the server fn (running as anon) can call them
REVOKE ALL ON FUNCTION public.create_pending_lead(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_lead(uuid, text, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pending_lead(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_lead(uuid, text, jsonb, jsonb, text) TO anon, authenticated;

-- Tighten leads RLS: drop the permissive anon insert; all writes now go via SECURITY DEFINER functions
DROP POLICY IF EXISTS "Anyone can submit a valid lead" ON public.leads;