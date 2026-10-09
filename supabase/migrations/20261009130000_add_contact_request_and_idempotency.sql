-- Everything in this single migration is intentionally combined into one
-- atomic unit (Supabase applies one migration file as one transaction):
-- schema changes, the request_id idempotency key, the RPC function
-- exchange, and the matching grants. This guarantees there is never an
-- intermediate state where leads.email is NOT NULL while the OLD 7-arg
-- create_project_check_lead() (which never passed an email) is still the
-- live function — that function is dropped and replaced within the same
-- transaction that tightens the column.
--
-- No existing rows are migrated/backfilled anywhere in this file: no
-- Supabase project has ever been connected, so both tables are empty.

-- 1) leads: contact fields, request_id idempotency key, email tightened.
alter table public.leads
  add column request_id uuid not null,
  add column contact_name text,
  add column company text;

alter table public.leads add constraint leads_request_id_key unique (request_id);

alter table public.leads add constraint leads_contact_name_length check (
  contact_name is null or char_length(contact_name) <= 120
);
alter table public.leads add constraint leads_company_length check (
  company is null or char_length(company) <= 200
);

-- email becomes required: with this phase, a lead row is only ever created
-- together with a real contact request (see the RPC below) — the earlier
-- "anonymous lead from quiz completion alone" path no longer exists, so
-- there is no longer a case where email should be absent.
alter table public.leads alter column email set not null;

-- The original leads_email_format constraint allowed `email is null or ...`;
-- replace it with the tightened, NOT-NULL-aware version and add the two
-- new constraints the Edge Function's normalizeEmail() relies on matching.
alter table public.leads drop constraint leads_email_format;
alter table public.leads add constraint leads_email_format check (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);
alter table public.leads add constraint leads_email_max_length check (char_length(email) <= 254);
-- Enforces that only the already-normalized (trimmed, lowercased) form is
-- ever stored, matching what the Edge Function sends — defense in depth
-- independent of the application layer.
alter table public.leads add constraint leads_email_normalized check (
  email = lower(btrim(email))
);

-- 2) project_check_submissions: the optional inquiry message.
alter table public.project_check_submissions add column message text;
alter table public.project_check_submissions add constraint project_check_submissions_message_length check (
  message is null or char_length(message) <= 1000
);

-- 3) Replace create_project_check_lead() with a signature that also takes
-- the idempotency key and the contact fields. A different parameter list
-- is a different function overload in Postgres, not a replacement — the
-- old 7-arg version is dropped explicitly so it can never coexist with the
-- new one.
drop function public.create_project_check_lead(text, text, text, text, text, text, text);

create function public.create_project_check_lead(
  p_request_id uuid,
  p_path text,
  p_locale text,
  p_improvement_focus text,
  p_current_setup text,
  p_primary_goal text,
  p_start_timeframe text,
  p_recommendation_key text,
  p_email text,
  p_contact_name text,
  p_company text,
  p_message text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lead_id uuid;
begin
  -- Idempotent insert: ON CONFLICT (request_id) DO NOTHING is race-safe
  -- against two concurrent/retried calls carrying the same request_id,
  -- unlike a check-then-insert pattern. When this request_id already
  -- exists, RETURNING yields no row and v_lead_id stays NULL here (PL/pgSQL
  -- assigns NULL to an INTO target when the statement returns zero rows).
  insert into public.leads (request_id, email, contact_name, company, source, path, locale)
  values (p_request_id, p_email, p_contact_name, p_company, 'project_check', p_path, p_locale)
  on conflict (request_id) do nothing
  returning id into v_lead_id;

  if v_lead_id is null then
    -- Already stored by an earlier call with this request_id. Return the
    -- existing lead id untouched: never overwrite previously stored data,
    -- and never insert a second submission for the same request_id.
    select id into v_lead_id from public.leads where request_id = p_request_id;
    return v_lead_id;
  end if;

  insert into public.project_check_submissions (
    lead_id, improvement_focus, current_setup, primary_goal, start_timeframe, recommendation_key, message
  )
  values (
    v_lead_id, p_improvement_focus, p_current_setup, p_primary_goal, p_start_timeframe, p_recommendation_key, p_message
  );

  return v_lead_id;
end;
$$;

-- Same two-layer access model as every other function here: a newly
-- created function is implicitly executable by everyone by default, so
-- that default is revoked explicitly, then execution is granted only to
-- service_role.
revoke all on function public.create_project_check_lead(uuid, text, text, text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_project_check_lead(uuid, text, text, text, text, text, text, text, text, text, text, text) to service_role;
