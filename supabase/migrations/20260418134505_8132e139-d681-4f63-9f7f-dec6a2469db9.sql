create table public.leads (
  id uuid primary key default gen_random_uuid(),
  website text not null,
  email text not null,
  status text not null default 'pending',
  enrichment jsonb,
  audit jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_email_idx on public.leads (email);
create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Public can insert leads (lead capture form on landing page)
create policy "anyone can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- No public select policy: only service role (server functions) can read.