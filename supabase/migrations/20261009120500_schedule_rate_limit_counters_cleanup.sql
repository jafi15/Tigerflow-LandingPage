-- Time-driven, traffic-independent cleanup for rate_limit_counters.
--
-- check_rate_limit() already deletes expired rows lazily on every call, but
-- that alone does NOT guarantee the previously-claimed "30 minutes" bound:
-- if traffic stops entirely, nothing ever triggers that lazy cleanup and
-- stale rows would sit indefinitely. This migration closes that gap with a
-- real, scheduled job (pg_cron) that runs regardless of whether anyone
-- submits the Projekt-Check at all.
--
-- Honest bound: a row can be at most retention (30 minutes) + one cron
-- interval (15 minutes) old before it is guaranteed gone — roughly 45
-- minutes in the worst case of zero traffic, not a flat 30.
--
-- pg_cron jobs run under the role that scheduled them (the migration role,
-- which already owns these objects), so no new privilege for any role is
-- needed or added here.
create extension if not exists pg_cron;

-- Idempotent: unschedule any existing job with this name first, so
-- re-running this migration (e.g. after a project reset) never creates a
-- duplicate job or depends on cron.schedule's own upsert semantics.
select cron.unschedule(jobid) from cron.job where jobname = 'rate_limit_counters_cleanup';

select cron.schedule(
  'rate_limit_counters_cleanup',
  '*/15 * * * *',
  $$delete from public.rate_limit_counters where window_start < now() - interval '30 minutes'$$
);
