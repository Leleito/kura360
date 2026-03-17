-- KURA360 Initial Schema
-- Migration: 20260227171536_create_initial_schema
-- Creates all 8 core tables with RLS enabled

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. campaigns
-- ============================================================================
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  candidate_name text NOT NULL,
  position text NOT NULL CHECK (position IN ('president', 'governor', 'senator', 'women_rep', 'mp', 'mca')),
  county text,
  constituency text,
  ward text,
  party text,
  subscription_tier text NOT NULL DEFAULT 'aspirant' CHECK (subscription_tier IN ('aspirant', 'contender', 'governor', 'presidential')),
  spending_limit_kes bigint,
  bank_account_number text,
  bank_name text,
  donation_portal_slug text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. campaign_members
-- ============================================================================
CREATE TABLE public.campaign_members (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('campaign_owner', 'finance_officer', 'agent_coordinator', 'agent', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. transactions
-- ============================================================================
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL,
  amount_kes bigint NOT NULL,
  reference text,
  vendor_name text,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'rejected')),
  flagged_reason text,
  recorded_by uuid NOT NULL REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  transaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. agents
-- ============================================================================
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  national_id text,
  phone text NOT NULL,
  photo_url text,
  assigned_station_id text,
  assigned_station_name text,
  county text,
  sub_county text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deployed', 'en_route', 'checked_in', 'completed', 'gap')),
  checked_in_at timestamptz,
  check_in_lat double precision,
  check_in_lon double precision,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
  payment_amount_kes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. evidence_items
-- ============================================================================
CREATE TABLE public.evidence_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  agent_id uuid REFERENCES public.agents(id),
  type text NOT NULL CHECK (type IN ('photo', 'video', 'document')),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_size_bytes bigint,
  sha256_hash text NOT NULL,
  gps_lat double precision,
  gps_lon double precision,
  station_id text,
  exif_json jsonb,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged')),
  verified_at timestamptz,
  captured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. donations
-- ============================================================================
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  donor_name text,
  donor_phone text,
  amount_kes bigint NOT NULL,
  mpesa_ref text UNIQUE,
  is_anonymous boolean NOT NULL DEFAULT false,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed', 'blocked')),
  compliance_status text NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'flagged', 'rejected', 'refunded')),
  flagged_reason text,
  receipt_number text UNIQUE,
  donated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. incidents
-- ============================================================================
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  agent_id uuid REFERENCES public.agents(id),
  station_id text,
  category text NOT NULL,
  description text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'escalated', 'resolved')),
  gps_lat double precision,
  gps_lon double precision,
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. audit_log
-- ============================================================================
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
