-- Explicit, minimal service_role grants for the lead-capture pipeline.
-- Supabase's platform-default privileges for service_role vary by project
-- configuration and must not be relied upon — every privilege the two RPC
-- functions actually need (both are `security invoker`, so the calling
-- role — service_role — needs the privileges itself) is granted here
-- explicitly, nothing more. public, anon and authenticated remain fully
-- excluded; the earlier migrations' default-deny already covers them, and
-- every statement below names service_role as the sole beneficiary.
--
-- Column-level SELECT grants below are not optional extras: Postgres
-- requires SELECT on a column in addition to INSERT/UPDATE whenever its
-- value is read — via RETURNING, or inside an UPDATE ... SET expression
-- like `request_count = request_count + 1` (verified against the current
-- PostgreSQL INSERT/UPDATE/DELETE documentation, see the accompanying
-- report).
grant usage on schema public to service_role;

-- create_project_check_lead(): one INSERT (with RETURNING id) into leads,
-- one plain INSERT into project_check_submissions.
grant insert on public.leads to service_role;
grant select (id) on public.leads to service_role;
grant insert on public.project_check_submissions to service_role;

-- check_rate_limit(): DELETE on window_start (read in the WHERE condition),
-- INSERT ... ON CONFLICT DO UPDATE (reads+writes request_count, writes
-- updated_at), RETURNING request_count.
grant insert, update, delete on public.rate_limit_counters to service_role;
grant select (window_start, request_count) on public.rate_limit_counters to service_role;

grant execute on function public.create_project_check_lead(text, text, text, text, text, text, text) to service_role;
grant execute on function public.check_rate_limit(text, timestamptz, integer, timestamptz) to service_role;
