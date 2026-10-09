-- Typed answers for one Projekt-Check run (src/components/ProjectCheck.jsx).
-- Columns and allowed values mirror QUESTIONS/RECOMMENDATIONS in that
-- component exactly; recommendation_key is only ever written by the
-- submit-lead Edge Function's server-side mapping, never taken from a
-- client-supplied value.
create table public.project_check_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  improvement_focus text not null,
  current_setup text not null,
  primary_goal text not null,
  start_timeframe text not null,
  recommendation_key text not null,
  constraint project_check_submissions_improvement_focus_allowed check (
    improvement_focus in ('webdesign', 'seo', 'inquiries', 'automation')
  ),
  constraint project_check_submissions_current_setup_allowed check (
    current_setup in ('none', 'existing', 'tools', 'unclear')
  ),
  constraint project_check_submissions_primary_goal_allowed check (
    primary_goal in ('clarity', 'visibility', 'response', 'efficiency')
  ),
  constraint project_check_submissions_start_timeframe_allowed check (
    start_timeframe in ('soon', 'one-to-three', 'three-plus', 'exploring')
  ),
  constraint project_check_submissions_recommendation_key_allowed check (
    recommendation_key in ('webdesign', 'seo', 'inquiries', 'automation')
  )
);

create index project_check_submissions_lead_id_idx on public.project_check_submissions (lead_id);
create index project_check_submissions_created_at_idx on public.project_check_submissions (created_at desc);

alter table public.project_check_submissions enable row level security;

-- Same two-layer access model as leads: no policy for any role, plus an
-- explicit revoke as an independent second barrier.
revoke all on public.project_check_submissions from public, anon, authenticated;
