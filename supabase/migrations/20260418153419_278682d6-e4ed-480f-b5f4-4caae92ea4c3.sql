-- Assessments table
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  analysis jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_user ON public.assessments (user_id, created_at DESC);
CREATE INDEX idx_assessments_org ON public.assessments (org_id, created_at DESC);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- SELECT: own rows OR admin of same org
CREATE POLICY "Users view own assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view org assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id));

-- No direct INSERT/UPDATE/DELETE — all writes go through SECURITY DEFINER RPCs

-- updated_at trigger
CREATE TRIGGER set_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RPC: create_assessment
CREATE OR REPLACE FUNCTION public.create_assessment(_answers jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _org uuid;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  _org := public.org_of(_uid);
  IF _org IS NULL THEN RAISE EXCEPTION 'No organization'; END IF;
  IF _answers IS NULL OR jsonb_typeof(_answers) <> 'object' THEN
    RAISE EXCEPTION 'Invalid answers';
  END IF;

  INSERT INTO public.assessments (org_id, user_id, status, answers)
  VALUES (_org, _uid, 'pending', _answers)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- RPC: finalize_assessment
CREATE OR REPLACE FUNCTION public.finalize_assessment(
  _id uuid,
  _status text,
  _analysis jsonb,
  _error text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _id IS NULL THEN RAISE EXCEPTION 'id required'; END IF;
  IF _status NOT IN ('pending', 'completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.assessments
    SET status = _status,
        analysis = COALESCE(_analysis, analysis),
        error = _error,
        updated_at = now()
  WHERE id = _id AND user_id = _uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found or not owned';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.create_assessment(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_assessment(uuid, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_assessment(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_assessment(uuid, text, jsonb, text) TO authenticated;