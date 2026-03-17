-- KURA360 RLS Policies v2
-- Migration: 20260228142550_add_comprehensive_rls_policies_v2
-- Adds row-level security policies for all 8 tables

-- Helper: check if user is a member of a campaign
CREATE OR REPLACE FUNCTION public.is_campaign_member(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns WHERE id = p_campaign_id AND owner_id = auth.uid()
    UNION ALL
    SELECT 1 FROM public.campaign_members WHERE campaign_id = p_campaign_id AND user_id = auth.uid()
  );
$$;

-- Helper: get user role for a campaign
CREATE OR REPLACE FUNCTION public.get_campaign_role(p_campaign_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM public.campaigns WHERE id = p_campaign_id AND owner_id = auth.uid())
        THEN 'campaign_owner'
      ELSE (SELECT role FROM public.campaign_members WHERE campaign_id = p_campaign_id AND user_id = auth.uid() LIMIT 1)
    END;
$$;

-- ── campaigns ──
CREATE POLICY "Users can view campaigns they own or are members of"
  ON public.campaigns FOR SELECT
  USING (owner_id = auth.uid() OR public.is_campaign_member(id));

CREATE POLICY "Users can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (owner_id = auth.uid());

-- ── campaign_members ──
CREATE POLICY "Members can view their campaign's members"
  ON public.campaign_members FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Owners can manage members"
  ON public.campaign_members FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) = 'campaign_owner');

CREATE POLICY "Owners can update members"
  ON public.campaign_members FOR UPDATE
  USING (public.get_campaign_role(campaign_id) = 'campaign_owner');

CREATE POLICY "Owners can remove members"
  ON public.campaign_members FOR DELETE
  USING (public.get_campaign_role(campaign_id) = 'campaign_owner');

-- ── transactions ──
CREATE POLICY "Members can view campaign transactions"
  ON public.transactions FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Finance roles can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'finance_officer'));

CREATE POLICY "Finance roles can update transactions"
  ON public.transactions FOR UPDATE
  USING (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'finance_officer'));

CREATE POLICY "Owners can delete transactions"
  ON public.transactions FOR DELETE
  USING (public.get_campaign_role(campaign_id) = 'campaign_owner');

-- ── agents ──
CREATE POLICY "Members can view agents"
  ON public.agents FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Coordinators can manage agents"
  ON public.agents FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator'));

CREATE POLICY "Coordinators can update agents"
  ON public.agents FOR UPDATE
  USING (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator'));

-- ── evidence_items ──
CREATE POLICY "Members can view evidence"
  ON public.evidence_items FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Agents and above can upload evidence"
  ON public.evidence_items FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator', 'agent'));

CREATE POLICY "Coordinators can verify evidence"
  ON public.evidence_items FOR UPDATE
  USING (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator'));

-- ── donations ──
CREATE POLICY "Members can view donations"
  ON public.donations FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Finance roles can record donations"
  ON public.donations FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'finance_officer'));

CREATE POLICY "Finance roles can update donations"
  ON public.donations FOR UPDATE
  USING (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'finance_officer'));

-- ── incidents ──
CREATE POLICY "Members can view incidents"
  ON public.incidents FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "Agents and above can report incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator', 'agent'));

CREATE POLICY "Coordinators can update incidents"
  ON public.incidents FOR UPDATE
  USING (public.get_campaign_role(campaign_id) IN ('campaign_owner', 'agent_coordinator'));

-- ── audit_log ──
CREATE POLICY "Members can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.is_campaign_member(campaign_id));

CREATE POLICY "System can insert audit entries"
  ON public.audit_log FOR INSERT
  WITH CHECK (public.is_campaign_member(campaign_id));
