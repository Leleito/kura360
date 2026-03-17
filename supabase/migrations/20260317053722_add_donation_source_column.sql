-- Migration: 20260317053722_add_donation_source_column
-- Adds source tracking for donation auto-fill channels (M-Pesa C2B, STK Push, CSV Import, Donor Portal)

ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
CHECK (source IN ('manual', 'mpesa_c2b', 'stk_push', 'csv_import', 'donor_portal'));

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_donations_source ON public.donations(source);

-- Index on mpesa_ref for duplicate detection in C2B callbacks
CREATE INDEX IF NOT EXISTS idx_donations_mpesa_ref ON public.donations(mpesa_ref) WHERE mpesa_ref IS NOT NULL;
