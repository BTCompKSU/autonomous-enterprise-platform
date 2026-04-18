DO $$
DECLARE
  _uid uuid := '825af5aa-8466-4878-b26e-a05472c89a58';
  _org_id uuid;
BEGIN
  IF (SELECT org_id FROM public.profiles WHERE id = _uid) IS NULL THEN
    INSERT INTO public.organizations (name, owner_admin_id)
    VALUES ('North Star Industries', _uid)
    RETURNING id INTO _org_id;

    UPDATE public.profiles
      SET org_id = _org_id,
          full_name = COALESCE(NULLIF(trim(full_name), ''), 'Brandon Tidd')
    WHERE id = _uid;

    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (_uid, _org_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;