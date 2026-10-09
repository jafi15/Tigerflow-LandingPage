-- Atomic write path for one Projekt-Check completion. A single plpgsql
-- function body is itself an implicit transaction: if the second insert
-- fails (e.g. a CHECK constraint violation), the whole call — including the
-- first insert — is rolled back automatically, with no explicit BEGIN/COMMIT
-- and no EXCEPTION handler that could otherwise mask a partial write.
--
-- security invoker (the default) is used deliberately instead of security
-- definer: the only caller permitted to execute this function at all is the
-- service role (see the revoke below), which already has full access to
-- both tables, so there is no need to run with elevated owner privileges.
create function public.create_project_check_lead(
  p_path text,
  p_locale text,
  p_improvement_focus text,
  p_current_setup text,
  p_primary_goal text,
  p_start_timeframe text,
  p_recommendation_key text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lead_id uuid;
begin
  insert into public.leads (source, path, locale)
  values ('project_check', p_path, p_locale)
  returning id into v_lead_id;

  insert into public.project_check_submissions (
    lead_id, improvement_focus, current_setup, primary_goal, start_timeframe, recommendation_key
  )
  values (
    v_lead_id, p_improvement_focus, p_current_setup, p_primary_goal, p_start_timeframe, p_recommendation_key
  );

  return v_lead_id;
end;
$$;

-- CREATE FUNCTION grants EXECUTE to PUBLIC by default — revoke it
-- explicitly. Only the service role (which already bypasses RLS and is not
-- affected by this revoke) may call this function; anon/authenticated must
-- never be able to invoke it directly even though it writes with the
-- invoking role's own privileges.
revoke all on function public.create_project_check_lead(text, text, text, text, text, text, text)
  from public, anon, authenticated;
