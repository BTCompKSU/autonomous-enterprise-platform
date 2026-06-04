
-- 1. Revoke public/anon execute on lead RPCs (server-only, used from server functions with service-role context).
REVOKE EXECUTE ON FUNCTION public.finalize_lead(uuid, text, jsonb, jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_pending_lead(text, text) FROM PUBLIC, anon, authenticated;

-- 2. Prevent users from changing their own org_id via direct profile UPDATE.
-- RLS WITH CHECK cannot reference OLD, so enforce via BEFORE UPDATE trigger.
CREATE OR REPLACE FUNCTION public.prevent_profile_org_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (server-side admin) to change org_id; block end-users.
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
    RAISE EXCEPTION 'Changing org_id is not allowed. Use the invite flow.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_org_change ON public.profiles;
CREATE TRIGGER profiles_prevent_org_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_org_change();

-- 3. Tighten remaining SECURITY DEFINER function grants:
-- Keep helpers callable by authenticated (used in RLS or app flows),
-- revoke from anon where not needed.
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin_org(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_invite_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_invite_code(integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_assessment(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalize_assessment(uuid, text, jsonb, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_org(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invite_code(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_assessment(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_assessment(uuid, text, jsonb, text) TO authenticated;
