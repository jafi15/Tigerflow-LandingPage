-- Core CRM contact table. email is nullable because the current
-- Projekt-Check collects no contact details (see src/components/
-- ProjectCheck.jsx: "Keine Kontaktdaten erforderlich") — a completed check
-- is still recorded as a lead, just without an email until one is known.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text,
  status text not null default 'new',
  source text not null,
  path text not null,
  locale text not null default 'de',
  constraint leads_email_format check (
    email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint leads_status_allowed check (
    status in ('new', 'contacted', 'qualified', 'won', 'lost')
  ),
  constraint leads_source_allowed check (
    source in ('project_check')
  ),
  constraint leads_path_format check (path ~ '^/'),
  constraint leads_locale_allowed check (locale in ('de'))
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_email_idx on public.leads (email) where email is not null;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

alter table public.leads enable row level security;

-- No policy is created for any role on purpose: anon/authenticated get zero
-- access by default. The explicit revoke below is a second, independent
-- layer that blocks access even if RLS were ever misconfigured.
revoke all on public.leads from public, anon, authenticated;
