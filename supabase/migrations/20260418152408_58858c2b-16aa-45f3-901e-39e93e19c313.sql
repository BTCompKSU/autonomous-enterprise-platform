-- ============= Enums =============
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- ============= Tables =============
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_admin_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.invite_codes (
  code TEXT PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.agent_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  min_confidence INT NOT NULL DEFAULT 90 CHECK (min_confidence BETWEEN 0 AND 100),
  is_paused BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, skill_id)
);

CREATE TABLE public.employee_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  can_use_builder BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, employee_id)
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_org_created ON public.activity_log(org_id, created_at DESC);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(org_id);
CREATE INDEX idx_profiles_org ON public.profiles(org_id);

-- ============= Security definer helpers =============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.org_of(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of(_user_id UUID, _org UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin' AND org_id = _org
  )
$$;

-- ============= Trigger: auto-create profile on signup =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= updated_at trigger =============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_governance_updated BEFORE UPDATE ON public.agent_governance
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_access_updated BEFORE UPDATE ON public.employee_agent_access
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= RPC: bootstrap admin org =============
CREATE OR REPLACE FUNCTION public.bootstrap_admin_org(_org_name TEXT, _full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _org_id UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF (SELECT org_id FROM public.profiles WHERE id = _uid) IS NOT NULL THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  INSERT INTO public.organizations (name, owner_admin_id)
  VALUES (COALESCE(NULLIF(trim(_org_name), ''), 'My Organization'), _uid)
  RETURNING id INTO _org_id;

  UPDATE public.profiles
    SET org_id = _org_id, full_name = COALESCE(NULLIF(trim(_full_name), ''), full_name)
  WHERE id = _uid;

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (_uid, _org_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _org_id;
END;
$$;

-- ============= RPC: create invite code =============
CREATE OR REPLACE FUNCTION public.create_invite_code(_expires_in_hours INT, _max_uses INT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _org UUID;
  _code TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  _org := public.org_of(_uid);
  IF _org IS NULL OR NOT public.is_admin_of(_uid, _org) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  _code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.invite_codes (code, org_id, created_by, expires_at, max_uses)
  VALUES (
    _code,
    _org,
    _uid,
    now() + make_interval(hours => GREATEST(1, LEAST(_expires_in_hours, 720))),
    GREATEST(1, LEAST(_max_uses, 100))
  );
  RETURN _code;
END;
$$;

-- ============= RPC: redeem invite code =============
CREATE OR REPLACE FUNCTION public.redeem_invite_code(_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _invite public.invite_codes;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF (SELECT org_id FROM public.profiles WHERE id = _uid) IS NOT NULL THEN
    RAISE EXCEPTION 'You already belong to an organization';
  END IF;

  SELECT * INTO _invite FROM public.invite_codes WHERE code = upper(trim(_code)) FOR UPDATE;
  IF _invite IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;
  IF _invite.expires_at < now() THEN RAISE EXCEPTION 'Invite code expired'; END IF;
  IF _invite.used_count >= _invite.max_uses THEN RAISE EXCEPTION 'Invite code fully used'; END IF;

  UPDATE public.profiles SET org_id = _invite.org_id WHERE id = _uid;

  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (_uid, _invite.org_id, 'employee')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.employee_agent_access (org_id, employee_id, can_use_builder, updated_by)
  VALUES (_invite.org_id, _uid, false, _uid)
  ON CONFLICT (org_id, employee_id) DO NOTHING;

  UPDATE public.invite_codes SET used_count = used_count + 1 WHERE code = _invite.code;

  RETURN _invite.org_id;
END;
$$;

-- ============= Enable RLS =============
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_agent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ============= RLS Policies =============
-- organizations
CREATE POLICY "Members can view their organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (id = public.org_of(auth.uid()));
CREATE POLICY "Admins can update their organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_admin_of(auth.uid(), id))
  WITH CHECK (public.is_admin_of(auth.uid(), id));

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users view org members profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (org_id IS NOT NULL AND org_id = public.org_of(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins view org roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id));
CREATE POLICY "Admins manage org roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id))
  WITH CHECK (public.is_admin_of(auth.uid(), org_id));

-- invite_codes
CREATE POLICY "Admins view org invites" ON public.invite_codes
  FOR SELECT TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id));
CREATE POLICY "Admins manage org invites" ON public.invite_codes
  FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id))
  WITH CHECK (public.is_admin_of(auth.uid(), org_id));

-- agent_governance
CREATE POLICY "Org members view governance" ON public.agent_governance
  FOR SELECT TO authenticated
  USING (org_id = public.org_of(auth.uid()));
CREATE POLICY "Admins manage governance" ON public.agent_governance
  FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id))
  WITH CHECK (public.is_admin_of(auth.uid(), org_id));

-- employee_agent_access
CREATE POLICY "Org members view access" ON public.employee_agent_access
  FOR SELECT TO authenticated
  USING (org_id = public.org_of(auth.uid()));
CREATE POLICY "Admins manage access" ON public.employee_agent_access
  FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id))
  WITH CHECK (public.is_admin_of(auth.uid(), org_id));

-- activity_log
CREATE POLICY "Org members insert activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (org_id = public.org_of(auth.uid()) AND actor_id = auth.uid());
CREATE POLICY "Admins view org activity" ON public.activity_log
  FOR SELECT TO authenticated
  USING (public.is_admin_of(auth.uid(), org_id));
