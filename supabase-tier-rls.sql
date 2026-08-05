-- DutyDocs — server-side tier enforcement
-- Run in the Supabase SQL Editor AFTER supabase-migration.sql.
--
-- What this does:
--   1. Makes `app_metadata.plan` the single source of truth for tier.
--      app_metadata is writable only by the service role, so a user cannot
--      grant themselves Pro the way they can with user_metadata.
--   2. Rewrites the RLS policies on `records` so the DATABASE refuses to
--      return or accept Pro-tier data for a Starter user. The client-side
--      checks stay, but only as UX.
--
-- Safe to re-run: every statement is idempotent.

-- ─── 1. Tier helpers ──────────────────────────────────────────────
-- Reads the plan claim out of the request JWT. Anything that is not
-- exactly 'pro' is treated as Starter, so a missing/garbled claim fails
-- CLOSED rather than granting access.
create or replace function public.current_plan()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'plan', 'starter');
$$;

create or replace function public.is_pro()
returns boolean
language sql
stable
as $$
  select public.current_plan() = 'pro';
$$;

-- The modules a Starter account may touch.
--
-- NOTE ON NAMING: these are the `records.module` values written by
-- useModuleData — NOT the nav slugs that the client's hasModuleAccess()
-- uses. The client compares slug-style names ('risk_assessment'), the
-- database stores plural names ('risk_assessments'). Policies must use
-- the values below or they will silently fail open.
--
-- 'bug_reports' is included deliberately: the Report a Bug page writes to
-- `records` and is currently ungated for everyone. Leaving it out would
-- break bug reporting for every Starter user. This is preserving existing
-- behaviour, not a decision about how bug_reports should be gated.
create or replace function public.starter_modules()
returns text[]
language sql
immutable
as $$
  select array[
    'risk_assessments',
    'coshh_assessments',
    'rams',
    'incidents',
    'near_misses',
    'bug_reports'
  ];
$$;

create or replace function public.module_allowed(p_module text)
returns boolean
language sql
stable
as $$
  select public.is_pro() or p_module = any(public.starter_modules());
$$;

-- ─── 2. Starter record cap, enforced in the database ──────────────
-- SECURITY DEFINER so the count sees every row the user owns. A plain
-- count here would be filtered by the very policy that calls it, so a
-- Starter user at the cap would count only their visible rows and the
-- cap would drift as modules became inaccessible.
create or replace function public.current_user_record_count()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::int from public.records where user_id = auth.uid();
$$;

revoke all on function public.current_user_record_count() from public;
grant execute on function public.current_user_record_count() to authenticated;

create or replace function public.under_record_cap()
returns boolean
language sql
stable
as $$
  select public.is_pro() or public.current_user_record_count() < 50;
$$;

-- ─── 3. Tier-aware RLS on records ─────────────────────────────────
alter table public.records enable row level security;

drop policy if exists "Users can view their own records" on public.records;
drop policy if exists "Users can view their own allowed records" on public.records;
create policy "Users can view their own allowed records"
  on public.records for select
  using (auth.uid() = user_id and public.module_allowed(module));

drop policy if exists "Users can insert their own records" on public.records;
drop policy if exists "Users can insert their own allowed records" on public.records;
create policy "Users can insert their own allowed records"
  on public.records for insert
  with check (
    auth.uid() = user_id
    and public.module_allowed(module)
    and public.under_record_cap()
  );

drop policy if exists "Users can update their own records" on public.records;
drop policy if exists "Users can update their own allowed records" on public.records;
create policy "Users can update their own allowed records"
  on public.records for update
  using (auth.uid() = user_id and public.module_allowed(module))
  with check (auth.uid() = user_id and public.module_allowed(module));

-- DELETE stays ownership-only, ON PURPOSE. If a Pro user downgrades, their
-- Pro-module rows become unreadable — gating them out of DELETE too would
-- strand that data with no way to remove it, and would break Settings →
-- Clear All Data (deleteAllRecords) for anyone who had ever been Pro.
drop policy if exists "Users can delete their own records" on public.records;
create policy "Users can delete their own records"
  on public.records for delete
  using (auth.uid() = user_id);

-- ─── 4. Backfill app_metadata.plan for existing users ─────────────
-- Without this every current user resolves to Starter the moment the
-- policies above go live, including the one real Pro account.

-- Accounts that must be Pro: the existing Pro user, the two master
-- emails, and the TEMP_TEST_EMAILS account (Bianca). Setting her plan
-- here is what preserves her access once the database is authoritative —
-- the client-side TEMP_TEST_EMAILS array is untouched and still works.
update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('plan', 'pro')
where lower(email) in (
        'christophersmithinvestment@gmail.com',
        'hello@dutydocsapp.com',
        'bianca.byrne1@icloud.com'
      )
   or raw_user_meta_data ->> 'plan' = 'pro';

-- Everyone else is explicitly Starter.
update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('plan', 'starter')
where raw_app_meta_data ->> 'plan' is null;

-- ─── 5. Verify ────────────────────────────────────────────────────
-- What matters here is that missing_plan is 0 and that every account
-- which SHOULD be Pro actually is. Don't expect a specific pro_users
-- count: the backfill above lists candidate emails, and only the ones
-- with real accounts match. On the 2026-08-05 run this was 2 of 9 —
-- hello@dutydocsapp.com is a contact address with no account behind it,
-- and the single legacy user_metadata Pro was already one of the named
-- emails. That is correct, not a shortfall.
--
-- If an account that should be Pro comes back Starter, it fails in the
-- worst way: TEMP_TEST_EMAILS/MASTER_EMAILS still unlock the UI, so the
-- modules appear and then read as empty, because RLS filters SELECTs
-- silently instead of erroring. Check by email, not by count.
select count(*)                                                as total_users,
       count(*) filter (where raw_app_meta_data ->> 'plan' = 'pro')     as pro_users,
       count(*) filter (where raw_app_meta_data ->> 'plan' = 'starter') as starter_users,
       count(*) filter (where raw_app_meta_data ->> 'plan' is null)     as missing_plan
from auth.users;

-- Expect 4 policies on records, three of them mentioning module_allowed.
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'records'
order by cmd, policyname;
