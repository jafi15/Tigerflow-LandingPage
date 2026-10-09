-- Security Advisor hardening: set_updated_at() (the trigger function that
-- maintains leads.updated_at) was created without an explicit search_path,
-- unlike create_project_check_lead()/check_rate_limit() which already set
-- it. A mutable search_path on a function is a defense-in-depth gap (it
-- could resolve unqualified identifiers against an attacker-influenced
-- schema order) even though this function's body has no unqualified
-- references today.
alter function public.set_updated_at() set search_path = '';
