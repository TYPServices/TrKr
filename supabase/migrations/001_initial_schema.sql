-- ============================================================
-- TrKr Initial Database Schema
-- Run this in the Supabase Dashboard → SQL Editor
-- Safe to re-run: drops and recreates everything cleanly
-- ============================================================

-- ── Teardown (safe re-run) ─────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

drop table if exists public.net_worth_snapshots cascade;
drop table if exists public.dividend_positions   cascade;
drop table if exists public.budget_categories    cascade;
drop table if exists public.holdings             cascade;
drop table if exists public.profiles             cascade;


-- ── profiles ──────────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  name            text,
  email           text,
  is_pro          boolean      not null default false,
  linked_accounts text[]       not null default '{}',
  created_at      timestamptz  not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);


-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── holdings ──────────────────────────────────────────────
create table public.holdings (
  id              uuid          default gen_random_uuid() primary key,
  user_id         uuid          references auth.users(id) on delete cascade not null,
  symbol          text          not null,
  name            text          not null,
  current_value   numeric(14,2) not null default 0,
  gain_loss_pct   numeric(8,4)  not null default 0,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

alter table public.holdings enable row level security;

create policy "holdings: select own" on public.holdings
  for select using (auth.uid() = user_id);

create policy "holdings: insert own" on public.holdings
  for insert with check (auth.uid() = user_id);

create policy "holdings: update own" on public.holdings
  for update using (auth.uid() = user_id);

create policy "holdings: delete own" on public.holdings
  for delete using (auth.uid() = user_id);

create index holdings_user_id_idx on public.holdings(user_id);


-- ── budget_categories ─────────────────────────────────────
create table public.budget_categories (
  id             uuid          default gen_random_uuid() primary key,
  user_id        uuid          references auth.users(id) on delete cascade not null,
  name           text          not null,
  budget_amount  numeric(10,2) not null,
  spent_amount   numeric(10,2) not null default 0,
  month          integer       not null check (month between 1 and 12),
  year           integer       not null,
  color          text          not null default '#2d8a8a',
  created_at     timestamptz   not null default now()
);

alter table public.budget_categories enable row level security;

create policy "budget: select own" on public.budget_categories
  for select using (auth.uid() = user_id);

create policy "budget: insert own" on public.budget_categories
  for insert with check (auth.uid() = user_id);

create policy "budget: update own" on public.budget_categories
  for update using (auth.uid() = user_id);

create policy "budget: delete own" on public.budget_categories
  for delete using (auth.uid() = user_id);

create index budget_user_month_idx
  on public.budget_categories(user_id, month, year);


-- ── dividend_positions ────────────────────────────────────
create table public.dividend_positions (
  id             uuid          default gen_random_uuid() primary key,
  user_id        uuid          references auth.users(id) on delete cascade not null,
  symbol         text          not null,
  annual_income  numeric(10,2) not null default 0,
  yield_pct      numeric(6,4)  not null default 0,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

alter table public.dividend_positions enable row level security;

create policy "dividends: select own" on public.dividend_positions
  for select using (auth.uid() = user_id);

create policy "dividends: insert own" on public.dividend_positions
  for insert with check (auth.uid() = user_id);

create policy "dividends: update own" on public.dividend_positions
  for update using (auth.uid() = user_id);

create policy "dividends: delete own" on public.dividend_positions
  for delete using (auth.uid() = user_id);

create index dividends_user_id_idx on public.dividend_positions(user_id);


-- ── net_worth_snapshots ───────────────────────────────────
-- One row per snapshot (inserted daily / on Plaid webhook)
create table public.net_worth_snapshots (
  id                 uuid          default gen_random_uuid() primary key,
  user_id            uuid          references auth.users(id) on delete cascade not null,
  total_net_worth    numeric(14,2) not null,
  portfolio_value    numeric(14,2) not null default 0,
  portfolio_gain_pct numeric(8,4)  not null default 0,
  monthly_change     numeric(14,2) not null default 0,
  dividend_annual    numeric(10,2) not null default 0,
  dividend_goal      numeric(10,2) not null default 3000,
  budget_total       numeric(10,2) not null default 0,
  budget_spent       numeric(10,2) not null default 0,
  fi_target          numeric(14,2) not null default 1212000,
  created_at         timestamptz   not null default now()
);

alter table public.net_worth_snapshots enable row level security;

create policy "snapshots: select own" on public.net_worth_snapshots
  for select using (auth.uid() = user_id);

create policy "snapshots: insert own" on public.net_worth_snapshots
  for insert with check (auth.uid() = user_id);

create policy "snapshots: delete own" on public.net_worth_snapshots
  for delete using (auth.uid() = user_id);

create index snapshots_user_created_idx
  on public.net_worth_snapshots(user_id, created_at desc);
