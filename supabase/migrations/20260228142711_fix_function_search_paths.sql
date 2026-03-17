-- Migration: 20260228142711_fix_function_search_paths
-- Ensures all helper functions have explicit search_path set for security

ALTER FUNCTION public.is_campaign_member(uuid) SET search_path = public;
ALTER FUNCTION public.get_campaign_role(uuid) SET search_path = public;
