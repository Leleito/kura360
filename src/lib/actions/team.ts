'use server';

import { createClient } from '@/lib/supabase/server';
import { authorize } from '@/lib/rbac/authorize';
import type { Tables } from '@/types/database';

type CampaignMember = Tables<'campaign_members'>;

export type TeamMember = CampaignMember & {
  display_name: string;
};

/** Get all members for a campaign */
export async function getCampaignMembers(campaignId: string): Promise<{
  data: TeamMember[];
  error?: string;
}> {
  try {
    const auth = await authorize(campaignId, 'settings:read');
    if (!auth.ok) return { data: [], error: auth.error };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaign_members')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('joined_at', { ascending: true });

    if (error) return { data: [], error: error.message };

    // No separate profiles table yet — use user_id as display_name fallback
    const members: TeamMember[] = (data ?? []).map((row) => ({
      ...row,
      display_name: row.user_id,
    }));

    return { data: members };
  } catch (err) {
    return { data: [], error: String(err) };
  }
}

/** Invite a new member to a campaign */
export async function inviteMember(
  campaignId: string,
  userId: string,
  role: string
): Promise<{ data: CampaignMember | null; error?: string }> {
  try {
    const auth = await authorize(campaignId, 'campaign:manage_members');
    if (!auth.ok) return { data: null, error: auth.error };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaign_members')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        role,
        invited_by: auth.userId,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update the role of an existing campaign member */
export async function updateMemberRole(
  campaignId: string,
  memberId: string,
  newRole: string
): Promise<{ data: CampaignMember | null; error?: string }> {
  try {
    const auth = await authorize(campaignId, 'campaign:manage_members');
    if (!auth.ok) return { data: null, error: auth.error };

    const supabase = await createClient();

    // Prevent changing the campaign owner's role
    const { data: existing } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('id', memberId)
      .eq('campaign_id', campaignId)
      .single();

    if (!existing) return { data: null, error: 'Member not found' };
    if (existing.role === 'campaign_owner') {
      return { data: null, error: 'Cannot change the campaign owner role' };
    }

    const { data, error } = await supabase
      .from('campaign_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Remove a member from a campaign */
export async function removeMember(
  campaignId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await authorize(campaignId, 'campaign:manage_members');
    if (!auth.ok) return { success: false, error: auth.error };

    const supabase = await createClient();

    // Prevent removing the campaign owner
    const { data: existing } = await supabase
      .from('campaign_members')
      .select('role')
      .eq('id', memberId)
      .eq('campaign_id', campaignId)
      .single();

    if (!existing) return { success: false, error: 'Member not found' };
    if (existing.role === 'campaign_owner') {
      return { success: false, error: 'Cannot remove the campaign owner' };
    }

    const { error } = await supabase
      .from('campaign_members')
      .delete()
      .eq('id', memberId)
      .eq('campaign_id', campaignId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
