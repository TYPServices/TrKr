-- ============================================================
-- TrKr Initial Database Schema
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- ── profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid references auth.users(id) on delete cascade primary key,
  name           text,
  email          text,
  is_pro         boolean      not null default false,
  linked_accounts text[]      not null default '{}',
  created_at     timestamptz  not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own"  on public.profiles for select  using (auth.uid() = id);
create policy "profiles: insert own"  on public.profiles for insert  with check (auth.uid() = id);
create policy "profiles: update own"  on public.profiles for update  using (auth.uid() = id);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── holdings ──────────────────────────────────────────────
create table if not exists public.holdings (
  id              uuid         default gen_random_uuid() primary key,
  user_id         uuid         references auth.users(id) on delete cascade not null,
  symbol          text         not null,
  name            text         not null,
  current_value   numeric(14,2) not null default 0,
  gain_loss_pct   numeric(8,4)  not null default 0,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

alter table public.holdings enable row level security;
create policy "holdings: all own" on public.holdings using (auth.uid() = user_id);

create index if not exists holdings_user_id_idx on public.holdings(user_id);


-- ── budget_categories ─────────────────────────────────────
create table if not exists public.budget_categories (
  id             uuid         default gen_random_uuid() primary key,
  user_id        uuid         references auth.users(id) on delete cascade not null,
  name           text         not null,
  budget_amount  numeric(10,2) not null,
  spent_amount   numeric(10,2) not null default 0,
  month          integer      not null check (month between 1 and 12),
  year           integer      not null,
  color          text         not null default '#2d8a8a',
  created_at     timestamptz  not null default now()
);

alter table public.budget_categories enable row level security;
create policy "budget: all own" on public.budget_categories using (auth.uid() = user_id);

create index if not exists budget_user_month_idx
  on public.budget_categories(user_id, month, year);


-- ── dividend_positions ────────────────────────────────────
create table if not exists public.dividend_positions (
  id             uuid         default gen_random_uuid() primary key,
  user_id        uuid         references auth.users(id) on delete cascade not null,
  symbol         text         not null,
  annual_income  numeric(10,2) not null default 0,
  yield_pct      numeric(6,4)  not null default 0,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

alter table public.dividend_positions enable row level security;
create policy "dividends: all own" on public.dividend_positions using (auth.uid() = user_id);

create index if not exists dividends_user_id_idx on public.dividend_positions(user_id);


-- ── net_worth_snapshots ───────────────────────────────────
-- One row per snapshot (inserted daily/on sync via Plaid webhook)
create table if not exists public.net_worth_snapshots (
  id                uuid         default gen_random_uuid() primary key,
  user_id           uuid         references auth.users(id) on delete cascade not null,
  total_net_worth   numeric(14,2) not null,
  portfolio_value   numeric(14,2) not null default 0,
  portfolio_gain_pct numeric(8,4) not null default 0,
  monthly_change    numeric(14,2) not null default 0,
  dividend_annual   numeric(10,2) not null default 0,
  dividend_goal     numeric(10,2) not null default 3000,
  budget_total      numeric(10,2) not null default 0,
  budget_spent      numeric(10,2) not null default 0,
  fi_target         numeric(14,2) not null default 1212000,
  created_at        timestamptz  not null default now()
);

alter table public.net_worth_snapshots enable row level security;
create policy "snapshots: all own" on public.net_worth_snapshots using (auth.uid() = user_id);

create index if not exists snapshots_user_created_idx
  on public.net_worth_snapshots(user_id, created_at desc);
