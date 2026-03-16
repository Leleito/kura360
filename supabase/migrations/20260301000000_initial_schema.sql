-- KURA360 Initial Schema Migration
-- Election Campaign Financing Act (ECFA) Compliance Platform
-- Generated from src/types/database.ts (Supabase auto-generated types)

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. campaigns
-- ============================================================================
create table if not exists public.campaigns (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  candidate_name  text not null,
  position        text not null,          -- e.g. 'governor', 'senator', 'mp', 'ward_rep'
  county          text,
  constituency    text,
  ward            text,
  party           text,
  is_active       boolean not null default true,
  subscription_tier text not null default 'free',
  spending_limit_kes numeric default 35000000,  -- ECFA statutory ceiling
  bank_account_number text,
  bank_name       text,
  donation_portal_slug text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Users can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = owner_id);

create policy "Users can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = owner_id);

-- ============================================================================
-- 2. campaign_members
-- ============================================================================
create table if not exists public.campaign_members (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null,              -- campaign_owner, finance_officer, agent_coordinator, agent, viewer
  invited_by  uuid references auth.users(id),
  joined_at   timestamptz not null default now(),
  unique(campaign_id, user_id)
);

alter table public.campaign_members enable row level security;

create policy "Members can view own memberships"
  on public.campaign_members for select
  using (auth.uid() = user_id);

create policy "Campaign owners can manage members"
  on public.campaign_members for all
  using (
    exists (
      select 1 from public.campaigns
      where id = campaign_members.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. transactions
-- ============================================================================
create table if not exists public.transactions (
  id               uuid primary key default uuid_generate_v4(),
  campaign_id      uuid not null references public.campaigns(id) on delete cascade,
  transaction_date timestamptz not null default now(),
  description      text not null,
  category         text not null,          -- venue_hire, publicity, advertising, transport, personnel, admin_other
  type             text not null default 'expense',  -- expense, income
  amount_kes       numeric not null check (amount_kes >= 0),
  vendor_name      text,
  reference        text,
  receipt_url      text,
  status           text not null default 'pending',  -- approved, pending, rejected
  flagged_reason   text,
  recorded_by      uuid not null references auth.users(id),
  verified_by      uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Campaign members can view transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = transactions.campaign_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.campaigns
      where id = transactions.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Authorized members can insert transactions"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.campaign_members
      where campaign_id = transactions.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'finance_officer')
    )
    or exists (
      select 1 from public.campaigns
      where id = transactions.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. donations
-- ============================================================================
create table if not exists public.donations (
  id                uuid primary key default uuid_generate_v4(),
  campaign_id       uuid not null references public.campaigns(id) on delete cascade,
  donated_at        timestamptz not null default now(),
  amount_kes        numeric not null check (amount_kes > 0),
  donor_name        text,
  donor_phone       text,
  is_anonymous      boolean not null default false,
  mpesa_ref         text,
  receipt_number    text,
  kyc_status        text not null default 'pending',       -- pending, verified, rejected
  compliance_status text not null default 'compliant',     -- compliant, flagged, violation
  flagged_reason    text,
  source            text,                                   -- manual, mpesa_c2b, stk_push, csv_import
  created_at        timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "Campaign members can view donations"
  on public.donations for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = donations.campaign_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.campaigns
      where id = donations.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Authorized members can insert donations"
  on public.donations for insert
  with check (
    exists (
      select 1 from public.campaign_members
      where campaign_id = donations.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'finance_officer')
    )
    or exists (
      select 1 from public.campaigns
      where id = donations.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. agents
-- ============================================================================
create table if not exists public.agents (
  id                    uuid primary key default uuid_generate_v4(),
  campaign_id           uuid not null references public.campaigns(id) on delete cascade,
  full_name             text not null,
  phone                 text not null,
  national_id           text,
  photo_url             text,
  status                text not null default 'pending',   -- pending, deployed, checked_in, active, inactive
  county                text,
  sub_county            text,
  assigned_station_id   text,
  assigned_station_name text,
  check_in_lat          double precision,
  check_in_lon          double precision,
  checked_in_at         timestamptz,
  payment_amount_kes    numeric,
  payment_status        text,
  user_id               uuid references auth.users(id),
  created_at            timestamptz not null default now()
);

alter table public.agents enable row level security;

create policy "Campaign members can view agents"
  on public.agents for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = agents.campaign_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.campaigns
      where id = agents.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Coordinators can manage agents"
  on public.agents for all
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = agents.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'agent_coordinator')
    )
    or exists (
      select 1 from public.campaigns
      where id = agents.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. evidence_items
-- ============================================================================
create table if not exists public.evidence_items (
  id                  uuid primary key default uuid_generate_v4(),
  campaign_id         uuid not null references public.campaigns(id) on delete cascade,
  agent_id            uuid references public.agents(id),
  station_id          text,
  title               text not null,
  description         text,
  type                text not null,             -- photo, video, document, audio
  file_url            text not null,
  sha256_hash         text not null,             -- cryptographic integrity
  file_size_bytes     bigint,
  gps_lat             double precision,
  gps_lon             double precision,
  exif_json           jsonb,
  captured_at         timestamptz not null default now(),
  verification_status text not null default 'pending',  -- pending, verified, flagged, rejected
  verified_by         uuid references auth.users(id),
  verified_at         timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.evidence_items enable row level security;

create policy "Campaign members can view evidence"
  on public.evidence_items for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = evidence_items.campaign_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.campaigns
      where id = evidence_items.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Agents and coordinators can insert evidence"
  on public.evidence_items for insert
  with check (
    exists (
      select 1 from public.campaign_members
      where campaign_id = evidence_items.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'agent_coordinator', 'agent')
    )
    or exists (
      select 1 from public.campaigns
      where id = evidence_items.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. incidents
-- ============================================================================
create table if not exists public.incidents (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  agent_id    uuid references public.agents(id),
  station_id  text,
  category    text not null,
  description text not null,
  urgency     text not null default 'medium',  -- low, medium, high
  status      text not null default 'open',    -- open, in_progress, resolved
  gps_lat     double precision,
  gps_lon     double precision,
  reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.incidents enable row level security;

create policy "Campaign members can view incidents"
  on public.incidents for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = incidents.campaign_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.campaigns
      where id = incidents.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Agents and coordinators can manage incidents"
  on public.incidents for all
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = incidents.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'agent_coordinator', 'agent')
    )
    or exists (
      select 1 from public.campaigns
      where id = incidents.campaign_id
        and owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. audit_log (append-only)
-- ============================================================================
create table if not exists public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id     text not null,               -- auth user id or 'system-*' for automated
  table_name  text not null,
  record_id   text,
  action      text not null,               -- INSERT, UPDATE, DELETE, BULK_IMPORT
  old_values  jsonb,
  new_values  jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Audit log is insert-only (no updates/deletes allowed via API)
create policy "Campaign members can view audit log"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.campaign_members
      where campaign_id = audit_log.campaign_id
        and user_id = auth.uid()
        and role in ('campaign_owner', 'finance_officer', 'viewer')
    )
    or exists (
      select 1 from public.campaigns
      where id = audit_log.campaign_id
        and owner_id = auth.uid()
    )
  );

create policy "Authorized members can insert audit entries"
  on public.audit_log for insert
  with check (true);  -- All authenticated users can create audit entries

-- ============================================================================
-- Indexes for performance
-- ============================================================================
create index if not exists idx_campaign_members_user on public.campaign_members(user_id);
create index if not exists idx_campaign_members_campaign on public.campaign_members(campaign_id);
create index if not exists idx_transactions_campaign on public.transactions(campaign_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
create index if not exists idx_donations_campaign on public.donations(campaign_id);
create index if not exists idx_donations_phone on public.donations(donor_phone);
create index if not exists idx_donations_mpesa_ref on public.donations(mpesa_ref);
create index if not exists idx_agents_campaign on public.agents(campaign_id);
create index if not exists idx_agents_county on public.agents(county);
create index if not exists idx_evidence_campaign on public.evidence_items(campaign_id);
create index if not exists idx_incidents_campaign on public.incidents(campaign_id);
create index if not exists idx_audit_log_campaign on public.audit_log(campaign_id);
create index if not exists idx_audit_log_table on public.audit_log(table_name);
create index if not exists idx_campaigns_slug on public.campaigns(donation_portal_slug) where donation_portal_slug is not null;

-- ============================================================================
-- Storage buckets (run via Supabase dashboard or storage API)
-- ============================================================================
-- evidence: 50MB max, private
-- receipts: 10MB max, private
-- avatars:  2MB max, public
