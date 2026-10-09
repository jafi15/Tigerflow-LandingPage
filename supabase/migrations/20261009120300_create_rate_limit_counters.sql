-- Data-minimal, pseudonymous rate limiting, fully separate from leads/
-- project_check_submissions: purely a technical counter, with no lead
-- linkage and no broader request-metadata table of any kind.
--
-- client_hash is a one-way, keyed hash of the requester's network address,
-- computed in the Edge Function with its own dedicated secret
-- (RATE_LIMIT_HASH_SECRET, independent from the database Secret Key). The
-- raw/full network address itself is never written to this or any other
-- table. window_start buckets requests into fixed windows; request_count is
-- a small counter. Rows are deleted lazily by check_rate_limit() itself once
-- older than a short retention threshold — no permanent history is kept.
create table public.rate_limit_counters (
  client_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (client_hash, window_start)
);

alter table public.rate_limit_counters enable row level security;

revoke all on public.rate_limit_counters from public, anon, authenticated;

-- Atomically deletes expired counters, then increments (or creates) the
-- counter for this client_hash/window_start pair in one statement via
-- INSERT ... ON CONFLICT, which is safe under concurrent calls for the same
-- bucket. Returns true when the caller is still within the allowed count
-- for this window, false once it is exceeded.
create function public.check_rate_limit(
  p_client_hash text,
  p_window_start timestamptz,
  p_max_per_window integer,
  p_retention_before timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.rate_limit_counters where window_start < p_retention_before;

  insert into public.rate_limit_counters (client_hash, window_start, request_count, updated_at)
  values (p_client_hash, p_window_start, 1, now())
  on conflict (client_hash, window_start)
  do update set request_count = public.rate_limit_counters.request_count + 1, updated_at = now()
  returning request_count into v_count;

  return v_count <= p_max_per_window;
end;
$$;

revoke all on function public.check_rate_limit(text, timestamptz, integer, timestamptz)
  from public, anon, authenticated;
